from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import User
from datetime import datetime, timedelta
import json

class Servico(models.Model):
    nome = models.CharField(max_length=100, verbose_name=_('Nome do Serviço'))
    atributo1 = models.CharField(max_length=100, verbose_name=_('Atributo 1'), blank=True, null=True)
    atributo2 = models.CharField(max_length=100, verbose_name=_('Atributo 2'), blank=True, null=True)
    atributo3 = models.CharField(max_length=100, verbose_name=_('Atributo 3'), blank=True, null=True)
    criado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_('Criado por'))
    # regioes = models.Choices(
    #     choices=[
    #         ('norte', _('Norte')),
    #         ('nordeste', _('Nordeste')),
    #         ('centro-oeste', _('Centro-Oeste')),
    #         ('sudeste', _('Sudeste')),
    #         ('sul', _('Sul'))
    # ])
    criado_em = models.DateTimeField(auto_now_add=True, verbose_name=_('Criado em'))
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name=_('Atualizado em'))

    def __str__(self):
        return self.nome

class Agendamento(models.Model):
    servico = models.ForeignKey(Servico, on_delete=models.PROTECT, verbose_name=_('Serviço'))
    data = models.DateField(verbose_name=_('Data'), default=datetime.now)
    vagas = models.PositiveIntegerField(verbose_name=_('Vagas'), default=1)

    class Meta:
        unique_together = ['servico', 'data']
    hora_inicio = models.TimeField(verbose_name=_('Hora de Início'), default=datetime.now)
    hora_fim = models.TimeField(verbose_name=_('Hora de Fim'), default=datetime.now)
    intervalo = models.PositiveIntegerField(verbose_name=_('Intervalo'), default=30)
    horarios_disponiveis = models.JSONField(verbose_name=_('Horários disponíveis'), blank=True, default=list)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_('Usuário'))
    status = models.CharField(max_length=20, choices=[
        ('disponivel', _('Disponível')),
        ('agendado', _('Agendado')),
        ('confirmado', _('Confirmado')),
        ('cancelado', _('Cancelado')),
        ('concluido', _('Concluído')),
    ], default='disponivel', verbose_name=_('Status'))
    criado_em = models.DateTimeField(auto_now_add=True, verbose_name=_('Criado em'))
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name=_('Atualizado em'))

    # def calcular_horarios_disponiveis(self):
    #     horarios = []
    #     hora_atual = datetime.combine(self.data, self.hora_inicio)
    #     hora_fim_dt = datetime.combine(self.data, self.hora_fim)

    #     while hora_atual < hora_fim_dt:
    #         horarios.append({
    #             "hora_agenda": hora_atual.strftime("%H:%M"),
    #             "status": True
    #         })
    #         hora_atual += timedelta(minutes=self.intervalo)

    #     self.horarios_disponiveis = json.dumps(horarios, ensure_ascii=False)


    def calcular_horarios_disponiveis(self):
        """Calcula os horários disponíveis com base na hora de início, intervalo e vagas."""
        horarios = []
        hora_atual = datetime.combine(self.data, self.hora_inicio)

        for _ in range(self.vagas):
            horarios.append({
                "hora_agenda": hora_atual.strftime("%H:%M"),
                "status": True
            })
            hora_atual += timedelta(minutes=self.intervalo)

        self.horarios_disponiveis = json.dumps(horarios, ensure_ascii=False)
        self.hora_fim = hora_atual.time()


    def save(self, *args, **kwargs):
        if self.pk is None: 
            self.calcular_horarios_disponiveis()
        super().save(*args, **kwargs) 

    def __str__(self):
        return f"{self.servico} - {self.data}"

class Agendar(models.Model):
    ESTADO_CIVIL_CHOICES = [
        ('solteiro', _('Solteiro')),
        ('casado', _('Casado')),
        ('divorciado', _('Divorciado')),
        ('viuvo', _('Viúvo')),
        ('menor', _('Menor de Idade')),
    ]

    cliente = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_('Cliente'))
    estado_civil = models.CharField(max_length=10, choices=ESTADO_CIVIL_CHOICES, verbose_name=_('Estado Civil'))
    servico = models.TextField(verbose_name=_('Serviço'), null=True, blank=True)
    horario = models.TextField(verbose_name=_('Horário'))
    cancelado = models.BooleanField(default=False, verbose_name=_('Cancelado'))
    compareceu = models.BooleanField(default=False, verbose_name=_('Compareceu'))
    confirmado = models.BooleanField(default=False, verbose_name=_('Confirmado'))
    data_agendamento = models.DateTimeField(verbose_name=_('Data do Agendamento'))
    rg_frente = models.ImageField(upload_to='documentos/rg/', verbose_name=_('RG (Frente)'), null=True, blank=True)
    rg_verso = models.ImageField(upload_to='documentos/rg/', verbose_name=_('RG (Verso)'), null=True, blank=True)
    cpf_documento = models.ImageField(upload_to='documentos/cpf/', verbose_name=_('CPF'), null=True, blank=True)
    certidao_nascimento = models.ImageField(upload_to='documentos/certidoes/', verbose_name=_('Certidão de Nascimento'), null=True, blank=True)
    certidao_casamento = models.ImageField(upload_to='documentos/certidoes/', verbose_name=_('Certidão de Casamento'), null=True, blank=True)
    certidao_casamento_averbada = models.ImageField(upload_to='documentos/certidoes/', verbose_name=_('Certidão de Casamento Averbada'), null=True, blank=True)
    certidao_obito = models.ImageField(upload_to='documentos/certidoes/', verbose_name=_('Certidão de Óbito'), null=True, blank=True)
    autorizacao_pais = models.ImageField(upload_to='documentos/autorizacoes/', verbose_name=_('Autorização dos Pais/Responsáveis'), null=True, blank=True)
    comprovante_residencia = models.ImageField(upload_to='documentos/comprovantes/', verbose_name=_('Comprovante de Residência'), null=True, blank=True)
    senha = models.CharField(max_length=10, verbose_name=_('Senha'), null=True, blank=True)

    def __str__(self):
        return f"{self.cliente.username} - {self.servico}"