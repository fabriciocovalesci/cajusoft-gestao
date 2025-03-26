from django.shortcuts import render
import json
from django.contrib import messages
from django.utils import timezone
from django.utils.timezone import now
from django.http import Http404, JsonResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.views import View
from django.views.generic import TemplateView
from django.core.files.storage import default_storage
import requests
from django.views.decorators.csrf import csrf_exempt
from servicos.models import Agendar
from servicos.utils import generate_random_password
from .models import Servico, Agendamento
from .forms import AgendamentoForm
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.views.generic import CreateView, UpdateView, DeleteView, ListView, DetailView
from django.urls import reverse_lazy
from django.db import IntegrityError, transaction
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect
from datetime import datetime, timedelta
from django.utils.text import slugify
from django.contrib.auth.models import User
from accounts.models import UserProfile
import re
from agendamento.models import Agendamento


N8N_WEBHOOK_URL = "https://evolution-n8n.gcuhcu.easypanel.host/webhook-test/ccb16792-b95d-4f7c-ae4f-e51cd49635b9"
N8N_WEBHOOK_URL_PRD = "https://evolution-n8n.gcuhcu.easypanel.host/webhook/ccb16792-b95d-4f7c-ae4f-e51cd49635b9"

class ServicePermissionMixin:
    def dispatch(self, request, *args, **kwargs):
        allowed_roles = ['admin', 'secretary', 'interviewer']
        if not request.user.is_authenticated or request.user.userprofile.role not in allowed_roles:
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

class AgendamentoListView(ListView):
    model = Agendamento
    template_name = 'agendamento/agendamento_list.html'
    context_object_name = 'agendamentos'
 

    def get_queryset(self):
        today = timezone.now().date()
        agendamentos = Agendamento.objects.filter(data=today).order_by('data')
        for agendamento in agendamentos:
            print("Atributo:", agendamento.servico)
            if agendamento.servico == "Cadastro Único":
                agendamento.atributo_slug = slugify("cadastro-unico")
            agendamento.atributo_slug = slugify(agendamento.atributo)

        return agendamentos
    

class AgendamentoListAdminView(ListView):
    model = Agendamento
    template_name = 'agendamento/agendamento_list_admin.html'
    context_object_name = 'agendamentos'
 

    def get_queryset(self):
        today = timezone.now().date()
        agendamentos = Agendamento.objects.filter(data=today).order_by('data')
        for agendamento in agendamentos:
            print("Atributo:", agendamento.servico)
            if agendamento.servico == "Cadastro Único":
                agendamento.atributo_slug = slugify("cadastro-unico")
            agendamento.atributo_slug = slugify(agendamento.atributo)

        return agendamentos


class AgendamentoCreateView(ServicePermissionMixin, CreateView):
    model = Agendamento
    form_class = AgendamentoForm
    template_name = 'agendamento/agendamento_form.html'
    success_url = reverse_lazy('agendamento:agendamento_list')

    def form_invalid(self, form):
        print("Erros de validação:", form.errors)

        # Mensagem geral
        messages.error(self.request, "Por favor, corrija os erros abaixo.")

        for field, errors in form.errors.items():
            if field == '__all__':
                for error in errors:
                    messages.error(self.request, error)
            else:
                for error in errors:
                    messages.error(self.request, f"{field}: {error}") 

        return super().form_invalid(form)


    def form_valid(self, form):
        try:
            form.instance.usuario = self.request.user

            agendamento = form.save(commit=False)
            agendamento.usuario = form.instance.usuario

            # if Agendamento.objects.filter(atributo=agendamento.atributo, data=agendamento.data).exists():
            #     messages.error(self.request, f"Já existe um agendamento para {agendamento.atributo} na data {agendamento.data}.")
            #     return self.form_invalid(form)
            # if Agendamento.objects.filter(servico="Cadastro Único", data=agendamento.data).exists():
            #     messages.error(self.request, f"Já existe um agendamento para Cadastro Único na data {agendamento.data}.")
            #     return self.form_invalid(form)
            agendamento.save()
            
            messages.success(self.request, 'Agendamentos criados com sucesso!')
            return super().form_valid(form)
        except Exception as e:
            print("Erro ao criar agendamentos:", str(e))
            messages.error(self.request, f'Erro ao criar agendamentos: {str(e)}')
            return self.form_invalid(form)  


class AgendamentoDetailView(DetailView):
    model = Agendamento
    template_name = 'agendamento/ag-detail.html'
    context_object_name = 'agendamentos'
    success_url = reverse_lazy('agendamento:agendamento_list')

    def get_object(self, queryset=None):
        slug = self.kwargs.get('slug')
        data_atual = now().date()
        return get_object_or_404(Agendamento, slug=slug, data=data_atual)
    

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        agendamento = self.object  # Acessa o único objeto do agendamento
        print("Atributo:", agendamento.servico)

        # Processa o atributo_slug baseado no atributo do agendamento
        if agendamento.servico == "Cadastro Único":
            agendamento.atributo_slug = slugify("cadastro-unico")
        else:
            agendamento.atributo_slug = slugify(agendamento.atributo)

        if self.request.user.is_authenticated:
            agenda = Agendar.objects.filter(cliente=self.request.user, agendado=True)
            if agenda.exists():
                context['agenda'] = agenda.first()
        context['agendamentos'] = agendamento 
        print("Contexto:", context)
        return context

class AgendamentoUpdateView(ServicePermissionMixin, UpdateView):
    model = Agendamento
    form_class = AgendamentoForm
    template_name = 'agendamento/agendamento_form.html'
    success_url = reverse_lazy('agendamento:agendamento_list')

class AgendamentoDeleteView(ServicePermissionMixin, DeleteView):
    model = Agendamento
    template_name = 'agendamento/agendamento_confirm_delete.html'
    success_url = reverse_lazy('agendamento:agendamento_list')


def get_atributos(request, pk): 
    try:
        servico = Servico.objects.get(id=pk)  
        atributos = [
            servico.atributo1,
            servico.atributo2,
            servico.atributo3,
        ]

        atributos = [atributo for atributo in atributos if atributo]
        return JsonResponse({'atributos': atributos, 'success': True, "service_name": servico.nome},
                            json_dumps_params={'ensure_ascii': False})
    except Servico.DoesNotExist:
        return JsonResponse({'atributos': []})
    

def agendamentos_da_semana(request, slug):
    get_slug = slugify(slug)
    # Buscar agendamentos disponíveis na semana
    agendamentos = Agendamento.objects.filter(slug=get_slug, status='disponivel')
    dados_agendamentos = []

    print(agendamentos)

    for agendamento in agendamentos:
        dados_agendamentos.append({
            'data': agendamento.data.strftime('%Y-%m-%d'),
            'horarios_disponiveis': json.loads(agendamento.horarios_disponiveis)
        })

    return JsonResponse(list(dados_agendamentos), safe=False)



def agendamentos_por_dia(request,slug,  data):

    dt_obj = datetime.strptime(data, '%Y-%m-%d')
    data_formatada = dt_obj.strftime('%d-%m-%Y')

    new_slug = re.sub(r'-\d{2}-\d{2}-\d{4}$', '', slug)
    new_slug = new_slug + "-" + data_formatada 
    print(new_slug)

    agendamentos = Agendamento.objects.filter(data=data , slug=new_slug, status='disponivel')
    print(agendamentos)
    
    dados_agendamentos = []
    for agendamento in agendamentos:
        dados_agendamentos.append({
            'id': agendamento.id,
            'data': agendamento.data.strftime('%Y-%m-%d'),
            'horarios_disponiveis': json.loads(agendamento.horarios_disponiveis) 
        })

    return JsonResponse(dados_agendamentos, safe=False)


@csrf_exempt
def agendar_api_wpp(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Formato JSON inválido'}, status=400)
        print("body ", data)
        agendamento = get_object_or_404(Agendamento, id=data.get('id', ''), slug=data.get('slug', ''))
        print('Acohouuu ', agendamento)
        with transaction.atomic():
            horarios_disponiveis = json.loads(agendamento.horarios_disponiveis)

            horarios_atualizados = []
            for horario in horarios_disponiveis:
                if horario["hora_agenda"] == data.get('horario', ''):
                    horario["status"] = False
                horarios_atualizados.append(horario)
            agendamento.vagas -= 1
            agendamento.horarios_disponiveis = json.dumps(horarios_atualizados)
            agendamento.save()

        novo_agendamento = Agendar.objects.create(
            cliente=request.user,
            servico=data.get('servico', ''),
            horario=data.get('horario', ''),
            data_agendamento=data.get('data_agendamento', ''),
            senha=f"CC{generate_random_password()}",
            agendado=True
        )
        data_email = {
            'data': data.get('data_agendamento', ''),
            'horario': data.get('horario', ''),
            'servico': data.get('servico', ''),
            'nome': request.user.first_name,
            'email': request.user.email,
            'senha': novo_agendamento.senha
        }

        # send_appointment_email_mainjet(data_email)
        user_profile = request.user.userprofile
        print("User Profile: ", request.user.first_name)
        print("User Profile CPF: ", user_profile.cpf)
        print("User Profile phone_person: ", user_profile.phone_person)
        print("User Profile phone_contact: ", user_profile.phone_contact)
        data_agendamento = data.get('data_agendamento', 'Não informado')

        if data_agendamento and data_agendamento != 'Não informado':
            data_agendamento = datetime.strptime(data_agendamento, "%Y-%m-%d").strftime("%d/%m/%Y")

        data_webhook = {
            'id': novo_agendamento.id,
            'data': data.get('data_agendamento', ''),
            'horario': data.get('horario', ''),
            'servico': data.get('servico', ''),
            'nome': request.user.first_name,
            'telefone': f"+55{user_profile.phone_person}",
            'email': request.user.email,
            'senha': novo_agendamento.senha,
            "mensagem": f"📢 *Agendamento Confirmado!* ✅\n\n"
                f"Olá, {request.user.first_name.capitalize()}! \n\nSeu serviço foi agendado com sucesso. 🛠️✨\n\n"
                f"📅 *Data:* {data_agendamento}\n"
                f"⏰ *Horário:* {data.get('horario', 'Não informado')}\n"
                f"🛠️ *Serviço:* {agendamento.atributo}\n"
                f"🔒 *Senha:* {novo_agendamento.senha}\n"
                f"📍 *Endereço:* R. Célso Nogueira, 540 - Centro\n\n"
                
                f"⚠️ *Emissão Prioritária de RG (Primeira e Segunda Via)*\n\n"
                f"*Exclusivo para:*\n"
                f"- Idosos\n"
                f"- Obesos\n"
                f"- Gestantes\n"
                f"- Deficientes\n"
                f"- Lactantes\n"
                f"- Pessoas com crianças de colo\n"
                f"- Doadores de sangue\n\n"
                
                f"É necessário comprovar a prioridade com documentos e/ou laudos médicos.\n\n"

                f"*Documentos a levar no dia:*\n"
                f"- Certidão de Nascimento ou Casamento (em caso de Divórcio: Averbação de Divórcio; em caso de viuvez: Certidão de Casamento com o óbito na mesma certidão)\n"
                f"- CPF\n"
                f"- Comprovante de endereço\n\n"

                f"*Menores de 16 anos* devem estar acompanhados de um responsável com RG e comprovante de endereço.\n\n"
                
                f"⚠️ *Emissão de RG (Primeira e Segunda Via)*\n\n"
                f"*Documentos a levar no dia:*\n"
                f"- Certidão de Nascimento ou Casamento (em caso de Divórcio: Averbação de Divórcio; em caso de viuvez: Certidão de Casamento com o óbito na mesma certidão)\n"
                f"- CPF\n"
                f"- Comprovante de endereço\n\n"

                f"*Menores de 16 anos* devem estar acompanhados de um responsável com RG e comprovante de endereço.\n\n"
                
                f"🔹 *Equipe CajuSoft*"
            }


        try:
            response = requests.post(N8N_WEBHOOK_URL_PRD, json=data_webhook, timeout=10)
            response.raise_for_status() 
        except requests.RequestException as e:
            return JsonResponse({'error': 'Falha ao enviar webhook', 'details': str(e)}, status=500)


        return JsonResponse({'message': 'Agendamento realizado com sucesso!', 'id': agendamento.id}, status=201)

    return JsonResponse({'error': 'Método não permitido'}, status=405)