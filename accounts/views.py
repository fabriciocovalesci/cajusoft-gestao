from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import AuthenticationForm, PasswordChangeForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth import update_session_auth_hash
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from accounts.models import UserProfile
from .forms import LoginForm, RegisterForm, UserProfileForm
from django.contrib.auth import logout
from django.contrib import messages
from django.contrib.auth.decorators import user_passes_test


def can_manage_users(user):
    return hasattr(user, 'userprofile') and user.userprofile.role in ['admin', 'secretary', 'interviewer']


@login_required
@user_passes_test(can_manage_users)
def user_management(request):
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'add_user':
            email = request.POST.get('email')
            password = request.POST.get('password')
            username = request.POST.get('username')
            role = request.POST.get('role')
            
            if email and password and role and username:
                try:
                    if User.objects.filter(email=email).exists():
                        messages.error(request, 'Este email já está em uso.')
                    else:
                        user = User.objects.create_user(
                            username=username,
                            email=email,
                            password=password
                        )
                        profile = UserProfile.objects.get(user=user)
                        profile.role = role
                        profile.save()
                        messages.success(request, 'Usuário criado com sucesso.')
                except Exception as e:
                    messages.error(request, f'Erro ao criar usuário: {str(e)}')
            else:
                messages.error(request, 'Todos os campos são obrigatórios.')
            return redirect('user_management')
            
        user_id = request.POST.get('user_id')
        new_role = request.POST.get('role')
        if user_id and new_role:
            try:
                profile = UserProfile.objects.get(user_id=user_id)
                if profile.user != request.user:
                    profile.role = new_role
                    profile.save()
                    messages.success(request, 'Perfil do usuário atualizado com sucesso.')
                else:
                    messages.error(request, 'Você não pode alterar seu próprio perfil.')
            except UserProfile.DoesNotExist:
                messages.error(request, 'Perfil de usuário não encontrado.')
        return redirect('user_management')
    
    profiles = UserProfile.objects.all().order_by('user__username')
    return render(request, 'accounts/user_management.html', {
        'profiles': profiles,
        'role_choices': UserProfile.ROLE_CHOICES
    })


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)  


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.userprofile.save()


def register_view(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data["password"])
            user.save()
            login(request, user)
            return redirect("agendamento_list")
    else:
        form = RegisterForm()
    return render(request, "accounts/register.html", {"form": form})

def login_view(request):
    if request.method == "POST":
        email = request.POST.get('email')
        password = request.POST.get('password')
        try:
            # Try to get a unique user by email
            user = User.objects.filter(email=email).first()
            if user is None:
                messages.error(request, "Email não encontrado.")
                return render(request, "accounts/login.html", {"form": LoginForm()})
            
            # Authenticate user with username and password
            authenticated_user = authenticate(request, username=user.username, password=password)
            if authenticated_user is not None:
                login(request, authenticated_user)
                return redirect("agendamento_list")
            else:
                messages.error(request, "Senha incorreta.")
        except Exception as e:
            messages.error(request, "Erro ao fazer login. Por favor, entre em contato com o suporte.")
    
    form = LoginForm()
    return render(request, "accounts/login.html", {"form": form})

@login_required
def password_change_view(request):
    if request.method == "POST":
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)
            return redirect("home")
    else:
        form = PasswordChangeForm(request.user)
    return render(request, "accounts/password_change.html", {"form": form})



@login_required
def profile_view(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    if request.method == "POST":
        form = UserProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            return redirect("profile")
    else:
        form = UserProfileForm(instance=profile)
    return render(request, "accounts/profile.html", {"form": form, "profile": profile})




def user_logout(request):
    logout(request)
    return redirect('login')
