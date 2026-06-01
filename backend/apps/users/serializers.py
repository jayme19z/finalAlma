from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for reading/updating the authenticated user profile."""

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'phone', 'is_pro']
        read_only_fields = ['id', 'email', 'is_pro']
        extra_kwargs = {
            'email': {'help_text': 'Unique email address (read-only after registration).'},
            'username': {'help_text': 'Display name visible to other users.'},
            'phone': {'help_text': 'Contact phone number in international format, e.g. +77001234567.'},
            'is_pro': {'help_text': 'Whether the user has an active Pro subscription.'},
        }


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for creating a new user account."""

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        help_text='Account password (min 8 characters). Write-only — never returned in responses.',
    )

    class Meta:
        model = User
        fields = ['email', 'username', 'phone', 'password']
        extra_kwargs = {
            'email': {'help_text': 'Unique email address used for login.'},
            'username': {'help_text': 'Display name.'},
            'phone': {'help_text': 'Unique phone number, e.g. +77001234567.'},
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            phone=validated_data['phone'],
            password=validated_data['password'],
        )
        return user


class SubscribeSerializer(serializers.Serializer):

    card_number = serializers.CharField(
        write_only=True,
        help_text='Card number, 13-19 digits (spaces allowed).',
    )
    card_holder = serializers.CharField(
        write_only=True,
        max_length=100,
        help_text='Name printed on the card.',
    )
    expiry = serializers.CharField(
        write_only=True,
        help_text='Expiry date in MM/YY format.',
    )
    cvc = serializers.CharField(
        write_only=True,
        help_text='3-4 digit security code.',
    )

    def validate_card_number(self, value):
        digits = value.replace(' ', '')
        if not digits.isdigit() or not (13 <= len(digits) <= 19):
            raise serializers.ValidationError('Enter a valid card number.')
        return digits

    def validate_expiry(self, value):
        value = value.strip()
        parts = value.split('/')
        if len(parts) != 2 or not all(p.strip().isdigit() for p in parts):
            raise serializers.ValidationError('Use MM/YY format.')
        month = int(parts[0])
        if not (1 <= month <= 12):
            raise serializers.ValidationError('Invalid expiry month.')
        return value

    def validate_cvc(self, value):
        value = value.strip()
        if not value.isdigit() or not (3 <= len(value) <= 4):
            raise serializers.ValidationError('Enter a valid CVC.')
        return value