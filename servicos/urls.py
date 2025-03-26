from django.urls import path
from . import views

from .views import (
    ServicoListView,
    ServicoDetailView,
    ServicoCreateView,
    ServicoUpdateView,
    ServicoDeleteView,

    AgendarListView,

    AgendarDetailView,

    update_appointment_attendance,
    AgendarDeleteView,
    AgendarCancelView,
    agendar_api
)

urlpatterns = [
    path('', views.home, name='home'),
    path('dashboard/', views.dashboard_home, name='dashboard_home'),

    ## SERVICO
    path('servico/', ServicoListView.as_view(), name='servico_list'),
    path('servico/<int:pk>/', ServicoDetailView.as_view(), name='servico_detail'),
    path('servico/create/', ServicoCreateView.as_view(), name='servico_create'),
    path('servico/update/<int:pk>/', ServicoUpdateView.as_view(), name='servico_update'),
    path('servico/delete/<int:pk>/', ServicoDeleteView.as_view(), name='servico_delete'),

    ## AGENDAR
    path('agendar/', AgendarListView.as_view(), name='agendar_list'),
    # path('agendar/novo/', AgendarCreateView.as_view(), name='agendar_create'),

    # path('agendar/novo/<int:id_agendar>/', AgendarCreateView.as_view(), name='agendar_create_with_id'),
    path('agendar/<int:pk>/', AgendarDetailView.as_view(), name='agendar_detail'),
    # path('agendar/<int:pk>/editar/', AgendarUpdateView.as_view(), name='agendar_update'),
    path('agendar/<int:pk>/excluir/', AgendarDeleteView.as_view(), name='agendar_delete'),
    path('agendar/<int:pk>/cancelar/', AgendarCancelView.as_view(), name='agendar_cancel'),
    path('agendar/historico/', views.AgendarHistoryView.as_view(), name='agendar_history'),


    path('api/horarios_disponiveis/<int:agendamento_id>/', views.horarios_disponiveis_api, name='horarios_disponiveis_api'),
    path('api/appointments/<int:pk>/attendance/', views.update_appointment_attendance, name='update_appointment_attendance'),
]
