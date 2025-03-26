from django.urls import path
from . import views

from .views import agendar_api_wpp

from .views import (
    AgendamentoListView,
    AgendamentoCreateView,
    AgendamentoDetailView,
    AgendamentoUpdateView,
    AgendamentoDeleteView,
    AgendamentoListAdminView,
)
app_name = 'agendamento' 

urlpatterns = [
    ## AGENDAMENTO
    path('', AgendamentoListView.as_view(), name='agendamento_list'),
    path('admin/', AgendamentoListAdminView.as_view(), name='agendamento_admin'),
    path('novo/', AgendamentoCreateView.as_view(), name='agendamento_create'),
    path('api/new/', agendar_api_wpp, name='agendar_create_api'),
    path('<slug:slug>/', AgendamentoDetailView.as_view(), name='agendamento_detail'),  
    path('<slug:slug>/editar/', AgendamentoUpdateView.as_view(), name='agendamento_update'),
    path('<slug:slug>/deletar/', AgendamentoDeleteView.as_view(), name='agendamento_delete'),
    path('get_atributos/<int:pk>/', views.get_atributos, name='get_atributos'),

    path('<slug:slug>/api/agendamentos/<str:data>/', views.agendamentos_por_dia, name='agendamentos_por_dia'),
    path('<slug:slug>/api/agendamentos-da-semana/', views.agendamentos_da_semana, name='get_agendamentos_da_semana'),
]
