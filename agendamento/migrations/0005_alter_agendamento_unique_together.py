# Generated by Django 5.1.6 on 2025-03-23 03:36

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('agendamento', '0004_alter_agendamento_slug'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='agendamento',
            unique_together={('atributo', 'data')},
        ),
    ]
