import random
import string
import resend
from django.conf import settings
from django.utils import timezone
from django.core.mail import send_mail
import boto3
from botocore.exceptions import BotoCoreError, ClientError
from mailjet_rest import Client
from core import settings

def generate_random_password(length=6):
    """Generate a random password with specified length."""
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

def get_appointment_email_template(agendamento):
    """Generate HTML email template for appointment confirmation."""
    return f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Confirmação de Agendamento</h2>
        <p>Olá {agendamento.get('nome')},</p>
        <p>Seu agendamento foi confirmado com sucesso!</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #444;">Detalhes do Agendamento:</h3>
            <p><strong>Serviço:</strong> {agendamento.get("servico")}</p>
            <p><strong>Data:</strong> {agendamento.get('data_agendamento')}</p>
            <p><strong>Horário:</strong> {agendamento.get('horario')}</p>
            <p><strong>Unidade:</strong> Hora Marcada Pacajus</p>
            <p><strong>Endereço:</strong> RUA CELSO NOGUEIRA, Nº 540 - CENTRO - CEP: 62.870-000</p>
            <p><strong>Sua senha:</strong> {agendamento.get('senha')}</p>
        </div>
        
        <p style="color: #666;">Por favor, chegue com 15 minutos de antecedência e apresente esta senha no local.</p>
        <p style="color: #666;">Em caso de dúvidas, entre em contato conosco.</p>
    </div>
    """

def get_cancellation_email_template(agendamento):
    """Generate HTML email template for appointment cancellation."""
    return f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Cancelamento de Agendamento</h2>
        <p>Olá {agendamento.get('nome')},</p>
        <p>Seu agendamento foi cancelado conforme solicitado.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #444;">Detalhes do Agendamento Cancelado:</h3>
            <p><strong>Serviço:</strong> {agendamento.get("servico")}</p>
            <p><strong>Data:</strong> {agendamento.get('data_agendamento')}</p>
            <p><strong>Horário:</strong> {agendamento.get('horario')}</p>
        </div>
        
        <p style="color: #666;">Caso deseje realizar um novo agendamento, acesse nossa plataforma.</p>
    </div>
    """

def send_appointment_email(agendamento, template_type='confirmation'):
    """Send email to user based on template type."""
    try:
        resend.api_key = "re_eLyqRhjZ_7GrmYGUdbze8WwfSXyAt8sGb" #settings.RESEND_API_KEY
        if template_type == 'confirmation':
            html_content = get_appointment_email_template(agendamento)
            subject = 'Confirmação de Agendamento'
        else:
            html_content = get_cancellation_email_template(agendamento)
            subject = 'Cancelamento de Agendamento'

        response = resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": agendamento.get('email'),
            "subject": subject,
            "html": html_content
        })
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False, str(e)
    

def enviar_email(destinatario, assunto, mensagem, remetente=None):
    """
    Envia um email usando Amazon SES.

    :param destinatario: Lista com os endereços de email dos destinatários.
    :param assunto: Assunto do email.
    :param mensagem: Corpo do email.
    :param remetente: (Opcional) Email remetente, usa o DEFAULT_FROM_EMAIL se não informado.
    """
    remetente = remetente or settings.DEFAULT_FROM_EMAIL

    try:
        send_mail(
            subject=assunto,
            message=mensagem,
            from_email=remetente,
            recipient_list=["fabcovalesci@gmail.com", destinatario] if isinstance(destinatario, str) else destinatario,
            fail_silently=False,
        )
        print("Email enviado com sucesso")
        return {"success": True, "message": "Email enviado com sucesso"}
    except Exception as e:
        print("Email enviado com erro", str(e))
        return {"success": False, "message": f"Erro ao enviar email: {str(e)}"}
    



def enviar_email_ses(destinatario, assunto, mensagem, mensagem_html=None, remetente=None):
    """
    Envia um email usando Amazon SES com boto3.

    :param destinatario: Lista com os endereços de email dos destinatários.
    :param assunto: Assunto do email.
    :param mensagem: Corpo do email em texto simples.
    :param mensagem_html: (Opcional) Corpo do email em HTML.
    :param remetente: (Opcional) Email do remetente (se não informado, usa settings.DEFAULT_FROM_EMAIL).
    """
    remetente = remetente or settings.DEFAULT_FROM_EMAIL
    destinatario = ["fabcovalesci@gmail.com", destinatario] if isinstance(destinatario, str) else destinatario

    ses_client = boto3.client(
        'ses',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_SES_REGION_NAME,  # Defina no settings.py
    )

    try:
        response = ses_client.send_email(
            Source=remetente,
            Destination={"ToAddresses": destinatario},
            Message={
                "Subject": {"Data": assunto},
                "Body": {
                    "Text": {"Data": mensagem},
                    "Html": {"Data": mensagem_html} if mensagem_html else {"Data": mensagem}
                }
            }
        )
        return {"success": True, "message": "Email enviado com sucesso", "message_id": response["MessageId"]}
    except (BotoCoreError, ClientError) as e:
        return {"success": False, "message": f"Erro ao enviar email: {str(e)}"}


def get_status(ag):
    if ag.cancelado:
        return "Cancelado"
    if ag.compareceu:
        return "Atendido"
    if ag.confirmado:
        return "Confirmado"
    return "Pendente"

def get_status_badge(ag):
    if ag.cancelado:
        return {"status": "Cancelado", "badge": "text-bg-danger"}
    if ag.compareceu:
        return {"status": "Compareceu", "badge": "text-bg-success"}
    if ag.confirmado:
        return {"status": "Confirmado", "badge": "text-bg-info"}
    if ag.agendado:
        return {"status": "Agendado", "badge": "text-bg-info"}
    return {"status": "Pendente", "badge": "text-bg-primary"}





def send_appointment_email_mainjet(agendamento, template_type='confirmation'):
    try:
        print("agendamento", agendamento )
        if template_type == 'confirmation':
            html_content = get_appointment_email_template(agendamento)
            subject = 'Confirmação de Agendamento'
        else:
            html_content = get_cancellation_email_template(agendamento)
            subject = 'Cancelamento de Agendamento'
        mailjet = Client(auth=(settings.MAILJET_API_KEY, settings.MAILJET_SECRET_KEY), version='v3.1')
        data = {
            'Messages': [
                {
                "From": {
                    "Email": 'smartflowai3@gmail.com',
                    "Name": "Hora Marcada Pacajus-CE"
                },
                "To": [
                    {
                    "Email": agendamento.get('email'),
                    "Name": "You"
                    }
                ],
                "Subject": subject,
                "TextPart": "Greetings from Mailjet!",
                "HTMLPart": html_content
                }
            ]
            }
        response = mailjet.send.create(data=data)
        if response.status_code == 200:
            print("Email enviado com sucesso")
        else:
            return False
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False