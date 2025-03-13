from django.urls import path
from django.contrib.auth.views import LogoutView, PasswordResetView, PasswordResetDoneView, PasswordResetConfirmView, PasswordResetCompleteView
from .views import profile_view, register_view, login_view, password_change_view, user_logout, user_management


name = "accounts"

urlpatterns = [
    path("register/", register_view, name="register"),
    path("login/", login_view, name="login"),
    path("logout/", user_logout, name="logout"),
    path("password-change/", password_change_view, name="password_change"),
    path("profile/", profile_view, name="profile"),
    path("user-management/", user_management, name="user_management"),
    path('password-reset/', PasswordResetView.as_view(template_name='accounts/password_reset.html', email_template_name='accounts/password_reset_email.html'), name='password_reset'),
    path('password-reset/done/', PasswordResetDoneView.as_view(template_name='accounts/password_reset_done.html'), name='password_reset_done'),
    path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(template_name='accounts/password_reset_confirm.html'), name='password_reset_confirm'),
    path('password-reset-complete/', PasswordResetCompleteView.as_view(template_name='accounts/password_reset_complete.html'), name='password_reset_complete'),
]
