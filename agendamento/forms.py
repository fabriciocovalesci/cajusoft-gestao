from datetime import datetime
import json
from django.utils import timezone
from django import forms
from .models import Servico, Agendamento


class AgendamentoForm(forms.ModelForm):
    class Meta:
        model = Agendamento
        fields = ['servico', 'atributo', 'prioritario', 'data', 'hora_inicio', 'intervalo', 'vagas']
        widgets = {
            'servico': forms.Select(attrs={'class': 'form-select'}),
            'atributo': forms.Select(attrs={'class': 'form-select', 'aria-describedby': 'atributoHelp'}),
            'prioritario': forms.CheckboxInput(attrs={'class': 'form-check-input', 'aria-describedby': 'prioritarioHelp'}),
            'data': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'vagas': forms.NumberInput(attrs={'class': 'form-control'}),
            'hora_inicio': forms.TimeInput(attrs={'type': 'time', 'class': 'form-control'}),
            'intervalo': forms.NumberInput(attrs={'class': 'form-control'}),
        }


    def __init__(self, *args, **kwargs):
        servicos = kwargs.pop('servicos', None)
        super().__init__(*args, **kwargs)

        if servicos is not None:
            self.fields['servico'].queryset = servicos
            self.fields['atributo'].choices = []


    def set_atributos(self, servico_id):
        try:
            servico = Servico.objects.get(id=servico_id)
            atributos = [
                (servico.atributo1, servico.atributo1),
                (servico.atributo2, servico.atributo2),
                (servico.atributo3, servico.atributo3),
            ]
            # Remove atributos em branco
            atributos = [atributo for atributo in atributos if atributo[0]]
            self.fields['atributo'].choices = atributos
        except Servico.DoesNotExist:
            self.fields['atributo'].choices = []


    # def clean(self):
    #     cleaned_data = super().clean()
    #     data = cleaned_data.get('data')
    #     hora_inicio = cleaned_data.get('hora_inicio')
    #     vagas = cleaned_data.get('vagas')

    #     # Validação da data
    #     if data and data < timezone.now().date():
    #         self.add_error('data', "A data do agendamento deve ser posterior ou igual à data atual.")

    #     # Validação da hora de início
    #     if hora_inicio:
    #         if isinstance(hora_inicio, str):
    #             hora_inicio = datetime.strptime(hora_inicio, "%H:%M").time()
    #         if data == timezone.now().date() and hora_inicio < timezone.now().time():
    #             self.add_error('hora_inicio', "A hora de início do agendamento deve ser posterior ou igual à hora atual.")

    #     # Validação das vagas
    #     if vagas is not None and vagas <= 0:
    #         self.add_error('vagas', "A quantidade de vagas deve ser maior que zero.")
    #     print("CLEAN ", cleaned_data)
    #     return cleaned_data
