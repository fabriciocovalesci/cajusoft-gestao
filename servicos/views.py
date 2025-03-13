import json
from django.contrib import messages
from django.utils import timezone
from django.http import Http404, JsonResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.views import View
from django.views.generic import TemplateView
from django.core.files.storage import default_storage
from .models import Servico, Agendamento, Agendar
from .forms import ServicoForm, AgendamentoForm, AgendarForm
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.views.generic import CreateView, UpdateView, DeleteView, ListView, DetailView
from django.urls import reverse_lazy
from django.db import transaction
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect
from .utils import enviar_email, enviar_email_ses, generate_random_password, get_status, send_appointment_email, get_status_badge


def home(request):
    # return render(request, 'home/index.html')
    return render(request, 'landing.html')

@login_required
@csrf_protect
@require_http_methods(['POST'])
def update_appointment_attendance(request, pk):
    try:
        appointment = get_object_or_404(Agendar, pk=pk)
        data = json.loads(request.body)
        appointment.compareceu = data.get('compareceu', False)
        appointment.save()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@login_required
def dashboard_home(request):
    today = timezone.now().date()
    appointments_data = Agendar.objects.filter(data_agendamento=today)
    week_appointments = Agendar.objects.filter(data_agendamento__range=[today, today + timezone.timedelta(days=7)])
    services = Servico.objects.all()
    clients_served = Agendar.objects.filter(compareceu=True).count()
    
    # Get appointments by service data for the chart
    service_data = []
    service_labels = []
    for service in services:
        count = Agendar.objects.filter(servico=service).count()
        service_data.append(count)
        service_labels.append(service.nome)
    
    # Get upcoming dates with appointment counts
    upcoming_dates = {}
    next_7_days = [today + timezone.timedelta(days=x) for x in range(1, 8)]
    for date in next_7_days:
        count = Agendar.objects.filter(data_agendamento=date).count()
        if count > 0:
            upcoming_dates[date] = count
  
    today_appointments_data = [
            {   
                "id": ag.id,
                "cliente": ag.cliente.username, 
                "servico": ag.servico,
                "horario": ag.horario,
                "status": get_status_badge(ag)["status"],
                "badge_class": get_status_badge(ag)["badge"],
            }
            for ag in appointments_data
        ]

    context = {
        'today_appointments': today_appointments_data,
        'today_appointments_count': appointments_data.count(),
        'week_appointments_count': week_appointments.count(),
        'services_count': services.count(),
        'clients_served': clients_served,
        'service_data': service_data,
        'service_labels': json.dumps(service_labels),
        'upcoming_dates': upcoming_dates,
    }
    return render(request, 'dashboard/home.html', context)

class ServicePermissionMixin:
    def dispatch(self, request, *args, **kwargs):
        allowed_roles = ['admin', 'secretary', 'interviewer']
        if not request.user.is_authenticated or request.user.userprofile.role not in allowed_roles:
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

# Listar serviços
class ServicoListView(ServicePermissionMixin, ListView):
    model = Servico
    template_name = 'service/servico_list.html'
    context_object_name = 'servicos'

# Detalhar serviço
class ServicoDetailView(ServicePermissionMixin, DetailView):
    model = Servico
    template_name = 'service/servico_detail.html'
    context_object_name = 'servico'

# Criar serviço
class ServicoCreateView(ServicePermissionMixin, CreateView):
    model = Servico
    form_class = ServicoForm
    template_name = 'service/servico_form.html'
    success_url = reverse_lazy('servico_list')

# Atualizar serviço
class ServicoUpdateView(ServicePermissionMixin, UpdateView):
    model = Servico
    form_class = ServicoForm
    template_name = 'service/servico_form.html'
    success_url = reverse_lazy('servico_list')

# Deletar serviço
class ServicoDeleteView(ServicePermissionMixin, DeleteView):
    model = Servico
    template_name = 'service/servico_confirm_delete.html'
    success_url = reverse_lazy('servico_list')

## Agendamentos ##

class AgendamentoListView(ListView):
    model = Agendamento
    template_name = 'agendamento/agendamento_list.html'
    context_object_name = 'agendamentos'

    def get_queryset(self):
        today = timezone.now().date() 
        return Agendamento.objects.filter(data__gte=today, vagas__gt=0)

class AgendamentoCreateView(ServicePermissionMixin, CreateView):
    model = Agendamento
    form_class = AgendamentoForm
    template_name = 'agendamento/agendamento_form.html'
    success_url = reverse_lazy('agendamento_list')

    def form_valid(self, form):
        try:
            form.instance.usuario = self.request.user
            response = super().form_valid(form)
            messages.success(self.request, 'Agendamento criado com sucesso!')
            return response
        except Exception as e:
            messages.error(self.request, f'Erro ao criar agendamento: {str(e)}')
            return self.form_invalid(form)

    def form_invalid(self, form):
        messages.error(self.request, 'Erro ao criar agendamento. Por favor, verifique os dados informados.')
        return super().form_invalid(form)

class AgendamentoDetailView(ServicePermissionMixin, DetailView):
    model = Agendamento
    template_name = 'agendamento/agendamento_detail.html'
    context_object_name = 'agendamento'

class AgendamentoUpdateView(ServicePermissionMixin, UpdateView):
    model = Agendamento
    form_class = AgendamentoForm
    template_name = 'agendamento/agendamento_form.html'
    success_url = reverse_lazy('agendamento_list')

class AgendamentoDeleteView(ServicePermissionMixin, DeleteView):
    model = Agendamento
    template_name = 'agendamento/agendamento_confirm_delete.html'
    success_url = reverse_lazy('agendamento_list')

## FIM Agendamentos ##
class AgendarListView(ListView):
    model = Agendar
    template_name = 'agendar/agendar_list.html'
    context_object_name = 'agendamentos'
    ordering = ['-data_agendamento']

    def get_queryset(self):
        return Agendar.objects.filter(cliente=self.request.user, cancelado=False, compareceu=False).order_by('-data_agendamento')

class AgendarHistoryView(ListView):
    model = Agendar
    template_name = 'agendar/agendar_history.html'
    context_object_name = 'agendamentos'
    ordering = ['-data_agendamento']
    paginate_by = 5

    def get_queryset(self):
        return Agendar.objects.filter(cliente=self.request.user).order_by('-data_agendamento')

class AgendarCreateView(CreateView):
    model = Agendar
    form_class = AgendarForm
    template_name = 'agendar/agendar_form.html'
    success_url = reverse_lazy('agendar_list')

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        # Captura o id_agendar da URL
        id_agendar = self.kwargs.get('id_agendar', None)
        # Adiciona o id_agendar aos kwargs
        if id_agendar:
            kwargs['id_agendar'] = id_agendar
        return kwargs
    
    def form_valid(self, form):
        status = enviar_email_ses(["smartflowai3@gmail.com"], 'Agendamento criado', 'Olá, seu agendamento foi criado com sucesso!')

        form.instance.cliente = self.request.user
        form.instance.horario  = form.cleaned_data.get('horarios_disponiveis')
        form.instance.servico = self.request.POST.get('atributo') 
        form.instance.data_agendamento = form.cleaned_data.get('data')
        form.instance.senha = f"CC{generate_random_password()}" 
        agendamento = Agendamento.objects.filter(data=form.cleaned_data.get('data')).first()
        if not agendamento:
            raise Http404("Nenhum agendamento encontrado para essa data")

        with transaction.atomic():
            if agendamento.vagas > 0:
                agendamento.vagas -= 1
                agendamento.save()

            horarios_disponiveis = json.loads(agendamento.horarios_disponiveis)

            horarios_atualizados = []
            for horario in horarios_disponiveis:
                if horario["hora_agenda"] == form.cleaned_data.get('horarios_disponiveis'):
                    horario["status"] = False
                horarios_atualizados.append(horario)

            agendamento.horarios_disponiveis = json.dumps(horarios_atualizados)
            agendamento.save()

            # Salvar arquivos de mídia e armazenar suas URLs
        if form.cleaned_data.get('rg_frente'):
            rg_frente_file = form.cleaned_data['rg_frente']
            rg_frente_url = default_storage.save(f'rg_frente/{rg_frente_file.name}', rg_frente_file)
            form.instance.rg_frente = rg_frente_url  # Atualize o campo no modelo

        if form.cleaned_data.get('rg_verso'):
            rg_verso_file = form.cleaned_data['rg_verso']
            rg_verso_url = default_storage.save(f'rg_verso/{rg_verso_file.name}', rg_verso_file)
            form.instance.rg_verso = rg_verso_url  # Atualize o campo no modelo

        if form.cleaned_data.get('cpf_documento'):
            cpf_documento_file = form.cleaned_data['cpf_documento']
            cpf_documento_url = default_storage.save(f'cpf_documento/{cpf_documento_file.name}', cpf_documento_file)
            form.instance.cpf_documento = cpf_documento_url  # Atualize o campo no modelo

        if form.cleaned_data.get('certidao_casamento'):
            certidao_casamento_file = form.cleaned_data['certidao_casamento']
            certidao_casamento_url = default_storage.save(f'certidao_casamento/{certidao_casamento_file.name}', certidao_casamento_file)
            form.instance.certidao_casamento = certidao_casamento_url  # Atualize o campo no modelo

        if form.cleaned_data.get('comprovante_residencia'):
            comprovante_residencia_file = form.cleaned_data['comprovante_residencia']
            comprovante_residencia_url = default_storage.save(f'comprovante_residencia/{comprovante_residencia_file.name}', comprovante_residencia_file)
            form.instance.comprovante_residencia = comprovante_residencia_url  # Atualize o campo no modelo

            
            # Send confirmation email
            data_agendamento_formatada = form.instance.data_agendamento.strftime("%d/%m/%Y")
            appointment_info = {
                "data_agendamento": data_agendamento_formatada,
                "horario": form.instance.horario,
                "servico": form.instance.servico,
                "senha": form.instance.senha,
                "user": form.instance.cliente,
                "email": form.instance.cliente.email
            }
            # success = send_appointment_email(appointment_info)
            status = enviar_email_ses([form.instance.cliente.email], 'Agendamento criado', 'Olá, seu agendamento foi criado com sucesso!')
            print(status)
            if not status.get('success'):
                messages.warning(self.request, "Agendamento criado, mas houve um problema ao enviar o email de confirmação.")
                
        return super().form_valid(form)
    

    
    def form_invalid(self, form):
        print(form.errors)  # Adicione esta linha para verificar os erros de validação
        return super().form_invalid(form)

class AgendarDetailView(DetailView):
    model = Agendar
    template_name = 'agendar/agendar_detail.html'
    context_object_name = 'agendamento'
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        agendamento = self.object
        
        # Crie um dicionário para armazenar os campos de documentos
        document_fields = [
            'rg_frente',
            'rg_verso',
            'cpf_documento',
            'certidao_nascimento',
            'certidao_casamento',
            'certidao_casamento_averbada',
            'certidao_obito',
            'autorizacao_pais',
            'comprovante_residencia'
        ]

        # Obtendo os valores dos documentos
        document_values = {field: getattr(agendamento, field, None) for field in document_fields}
        context['document_values'] = document_values

        return context

class AgendarUpdateView(UpdateView):
    model = Agendar
    form_class = AgendarForm
    template_name = 'agendar/agendar_form.html'
    success_url = reverse_lazy('agendar_list')

    def form_valid(self, form):
        form.instance.cliente = self.request.user
        form.instance.horario  = form.cleaned_data.get('horarios_disponiveis')
        form.instance.servico = self.request.POST.get('atributo') 
   

        form.instance.data_agendamento = form.cleaned_data.get('data')
        servico_id = self.request.POST.get('atributo')
        agendamento = get_object_or_404(Agendamento, data=form.cleaned_data.get('data'), servico_id=servico_id)

        with transaction.atomic():
            horarios_disponiveis = json.loads(agendamento.horarios_disponiveis)

            horarios_atualizados = []
            for horario in horarios_disponiveis:
                if horario["hora_agenda"] == form.cleaned_data.get('horarios_disponiveis'):
                    horario["status"] = False
                horarios_atualizados.append(horario)

            agendamento.horarios_disponiveis = json.dumps(horarios_atualizados)
            agendamento.save()
            
            # Send confirmation email
            # success, senha = send_appointment_email(self.request.user, form.instance)
            # if not success:
            #     messages.warning(self.request, "Agendamento criado, mas houve um problema ao enviar o email de confirmação.")
                
        return super().form_valid(form)

class AgendarDeleteView(DeleteView):
    model = Agendar
    template_name = 'agendar/agendar_confirm_delete.html'
    success_url = reverse_lazy('agendar_list')



class AgendarCancelConfirmView(TemplateView):
    template_name = 'agendar/agendar_confirm_cancel.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['agendamento'] = get_object_or_404(Agendar, pk=self.kwargs['pk'])
        return context


class AgendarCancelView(View):
    def get(self, request, pk, *args, **kwargs):
        agendamento = get_object_or_404(Agendar, pk=pk)
        if agendamento.cliente != request.user:
            raise PermissionDenied
        agendamento.cancelado = True
        agendamento.save()
        messages.success(request, "Agendamento cancelado com sucesso.")
        return redirect('agendar_list')

    def post(self, request, pk, *args, **kwargs):
        return self.get(request, pk, *args, **kwargs)

class AgendarCancelConfirmView(TemplateView):
    def post(self, request, pk, *args, **kwargs):
        agendamento = get_object_or_404(Agendar, pk=pk)
        agendamento.cancelado = True
        agendamento.save()
        messages.success(request, "Agendamento cancelado com sucesso.")
        return redirect(reverse_lazy('agendar_list'))


def horarios_disponiveis_api(request, agendamento_id):
    try:
        agendamento = Agendamento.objects.get(id=agendamento_id, status='disponivel')
        horarios = json.loads(agendamento.horarios_disponiveis)
        horarios_disponiveis = [h for h in horarios if h["status"]]
        return JsonResponse(horarios_disponiveis, safe=False)
    except Agendamento.DoesNotExist:
        return JsonResponse([], safe=False)
