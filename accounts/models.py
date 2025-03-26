
from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext as _
from django.db.models.signals import post_save
from django.dispatch import receiver

# Make User email field unique
User._meta.get_field('email')._unique = True


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('secretary', 'Secretario'),
        ('interviewer', 'Entrevistador'),
        ('client', 'Cliente'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    phone_person = models.CharField(_('Telefone Pessoal'), max_length=15)
    phone_contact = models.CharField(_('Telefone Contato'), max_length=15, blank=True, null=True)
    cpf = models.CharField(_('CPF'), max_length=11, unique=True)
    avatar = models.ImageField(_('Avatar'), upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(_('Criado em'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Atualizado em'), auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"
    
    
    def can_manage_services(self):
        return self.role in ['admin', 'secretary', 'interviewer']
