import json
from django import forms
from .models import Servico, Agendamento, Agendar
from django.utils.timezone import now


class ServicoForm(forms.ModelForm):
    class Meta:
        model = Servico
        fields = ['nome', 'atributo1', 'atributo2', 'atributo3'] 
        widgets = {
            'nome': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nome do Serviço'
            }),
            'atributo1': forms.TextInput(attrs={
                'class': 'form-control'
            }),
            'atributo2': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Atributo 2'
            }),
            'atributo3': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Atributo 3'
            })
        }

    def save(self, commit=True, user=None):
        servico = super().save(commit=False)
        if user:
            servico.criado_por = user
        if commit:
            servico.save()
        return servico



class AgendamentoForm(forms.ModelForm):
    class Meta:
        model = Agendamento
        fields = ['servico', 'data', 'vagas', 'hora_inicio', 'intervalo', 'vagas']
        widgets = {
            'servico': forms.Select(attrs={'class': 'form-select'}),
            'data': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'vagas': forms.NumberInput(attrs={'class': 'form-control'}),
            'hora_inicio': forms.TimeInput(attrs={'type': 'time', 'class': 'form-control'}),
            # 'hora_fim': forms.TimeInput(attrs={'type': 'time', 'class': 'form-control'}),
            'intervalo': forms.NumberInput(attrs={'class': 'form-control'}),
        }


class AgendarForm(forms.ModelForm):

    vagas = forms.CharField(required=False, widget=forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly'}))  # Se desejar que seja apenas informativo
    horarios_disponiveis = forms.ChoiceField(choices=[], required=False)
    atributo = forms.CharField(required=False, widget=forms.Select(attrs={'class': 'form-select'}))
    id_agendamento = forms.IntegerField(required=False, widget=forms.HiddenInput())
    # data_agendamento = forms.DateField(required=False, widget=forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly'}))
    data = forms.DateField(required=False, widget=forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly'}))
   
    class Meta:
        model = Agendar
        fields = [
             'estado_civil', 'servico', 'horarios_disponiveis',
            'rg_frente', 'rg_verso', 'cpf_documento', 'certidao_nascimento', 
            'certidao_casamento', 'certidao_casamento_averbada', 
            'certidao_obito', 'autorizacao_pais', 'comprovante_residencia'
        ]

        widgets = {
            'estado_civil': forms.Select(attrs={'class': 'form-select'}),
            'servico': forms.Select(attrs={'class': 'form-select'}),
            'rg_frente': forms.FileInput(attrs={'class': 'form-control'}),
            'rg_verso': forms.FileInput(attrs={'class': 'form-control'}),
            'cpf_documento': forms.FileInput(attrs={'class': 'form-control'}),
            'certidao_nascimento': forms.FileInput(attrs={'class': 'form-control'}),
            'certidao_casamento': forms.FileInput(attrs={'class': 'form-control'}),
            'certidao_casamento_averbada': forms.FileInput(attrs={'class': 'form-control'}),
            'certidao_obito': forms.FileInput(attrs={'class': 'form-control'}),
            'autorizacao_pais': forms.FileInput(attrs={'class': 'form-control'}),
            'comprovante_residencia': forms.FileInput(attrs={'class': 'form-control'}),
            'horarios_disponiveis': forms.Select(attrs={'class': 'form-select'}),
        }

        labels = {
            'rg_frente': 'RG (Frente)',
            'rg_verso': 'RG (Verso)',
            'cpf_documento': 'CPF',
            'certidao_nascimento': 'Certidão de Nascimento',
            'certidao_casamento': 'Certidão de Casamento',
            'certidao_casamento_averbada': 'Certidão de Casamento Averbada',
            'certidao_obito': 'Certidão de Óbito',
            'autorizacao_pais': 'Autorização dos Pais/Responsáveis',
            'comprovante_residencia': 'Comprovante de Residência',
        }
    def __init__(self, *args, **kwargs):
        id_agendar = kwargs.pop('id_agendar', None)
        super().__init__(*args, **kwargs)
        data_atual = now().date()

        if id_agendar:
            agendamentos_de_hoje = Agendamento.objects.filter(id=id_agendar)
        else:

            agendamentos_de_hoje = Agendamento.objects.filter(data=data_atual)

        for agendamento in agendamentos_de_hoje.iterator():     
            self.fields['vagas'].initial = agendamento.vagas
            self.fields['data'].initial = agendamento.data.strftime('%d/%m/%Y')

        self.set_horarios_disponiveis(agendamentos_de_hoje)

        self.fields['servico'].queryset = Servico.objects.filter(id__in=agendamentos_de_hoje.values_list('servico_id', flat=True))

        self.fields['servico'].widget.attrs.update({'class': 'form-select'})

    def set_horarios_disponiveis(self, agendamentos):
        """Preenche o campo de horários disponíveis com base nos agendamentos."""
        horarios_disponiveis = []

        for agendamento in agendamentos:
            try:
                horarios = json.loads(agendamento.horarios_disponiveis)
                horarios_disponiveis.extend(
                    [(hora['hora_agenda'], hora['hora_agenda']) for hora in horarios if hora.get('status') is True]
                )
            except json.JSONDecodeError:
                continue

        if horarios_disponiveis:
            self.fields['horarios_disponiveis'].choices = horarios_disponiveis
        else:
            self.fields['horarios_disponiveis'].choices = [('', 'Nenhum horário disponível')]


    def save(self, commit = ...,user=None):
        agenda = super().save(commit=False)
        if user:
            agenda.cliente = user
        if commit:
            agenda.save()
        return agenda
