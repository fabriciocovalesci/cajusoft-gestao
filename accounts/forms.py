from django import forms
from django.contrib.auth.models import User

from accounts.models import UserProfile

class RegisterForm(forms.ModelForm):
    cpf = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Digite seu CPF (somente números)'
        }),
        label="CPF"
    )
      
    phone_person = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Telefone (DD) 99999-9999'
        }),
        label="Telefone pessoal Whatsapp"
    )

    phone_contact = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Telefone para contato (DD) 99999-9999'
        }),
        label="Telefone para contato"
    )
        
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Senha'
        })
    )
    password_confirm = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Confirme a Senha'
        }),
        label="Confirme a Senha"
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'phone_person', 'phone_contact', 'cpf', 'password']
        widgets = {
            'username': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nome'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Email'
            })
        }

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        password_confirm = cleaned_data.get("password_confirm")
        email = cleaned_data.get("email")
        username = cleaned_data.get("username")

        if password and password_confirm and password != password_confirm:
            raise forms.ValidationError("As senhas não coincidem.")

        if email and User.objects.filter(email=email).exists():
            raise forms.ValidationError("Este email já está em uso.")

        if username and User.objects.filter(username=username).exists():
            raise forms.ValidationError("Este nome de usuário já está em uso.")

        return cleaned_data
    
    # def save(self, commit=True):
    #     user = super().save(commit=False)
    #     user.set_password(self.cleaned_data["password"])

    #     if commit:
    #         user.save()
    #         UserProfile.objects.create(user=user)

    #     return user



class LoginForm(forms.ModelForm):
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'Email'
        })
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Senha'
        })
    )

    class Meta:
        model = User
        fields = ['email', 'password']
        widgets = {
            'email': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Email de usuário'
            })
        }



# class UserProfileForm(forms.ModelForm):
#     class Meta:
#         model = UserProfile
#         fields = ['avatar', 'role', 'phone']


class UserProfileForm(forms.ModelForm):
    first_name = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Nome'
        })
    )
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'Email'
        })
    )
    role = forms.ChoiceField(
        choices=UserProfile.ROLE_CHOICES,
        required=True,
        widget=forms.Select(attrs={
            'class': 'form-control'
        })
    )

    class Meta:
        model = UserProfile
        fields = ['first_name', 'email', 'phone_person', 'phone_contact', 'cpf', 'role']
        widgets = {
            # 'avatar': forms.ClearableFileInput(attrs={
            #     'class': 'form-control'
            # }),
            'first_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nome'
            }),
            'phone_person': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Telefone'
            }),
            'phone_contact': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Telefone'
            }),
            'cpf': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'CPF'
            }),
            'role': forms.Select(attrs={
                'class': 'form-control',
                'placeholder': 'Cargo'
            })
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.user:
            self.fields['first_name'].initial = self.instance.user.first_name
            self.fields['email'].initial = self.instance.user.email

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.exclude(pk=self.instance.user.pk).filter(email=email).exists():
            raise forms.ValidationError('Este email já está em uso.')
        return email

    def clean_cpf(self):
        cpf = self.cleaned_data.get('cpf')
        if cpf and UserProfile.objects.exclude(pk=self.instance.pk).filter(cpf=cpf).exists():
            raise forms.ValidationError('Este CPF já está cadastrado.')
        return cpf

    def save(self, commit=True):
        profile = super().save(commit=False)
        if commit:
            # Update User model fields
            user = profile.user
            user.first_name = self.cleaned_data['first_name']
            user.email = self.cleaned_data['email']
            user.save()
            profile.save()
        return profile