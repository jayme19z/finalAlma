from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse, OpenApiExample

from apps.users.serializers import RegisterSerializer, UserSerializer, SubscribeSerializer


class RegisterView(generics.CreateAPIView):
    """Register a new user account.

    Creates a new user with the provided email, username, phone, and
    password.  Returns the created user profile on success.
    """

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Authentication'],
        summary='Register a new user',
        description=(
            'Create a new Almatour account. '
            'Email and phone must be unique. Password must be at least 8 characters.'
        ),
        examples=[
            OpenApiExample(
                'Registration Example',
                summary='Valid registration data',
                value={
                    'email': 'user@example.com',
                    'username': 'almaty_traveler',
                    'phone': '+77001234567',
                    'password': 'strongpassword123',
                },
                request_only=True,
            ),
        ],
        responses={
            201: OpenApiResponse(
                response=UserSerializer,
                description='User created successfully.',
            ),
            400: OpenApiResponse(description='Validation error (duplicate email/phone, weak password, etc.).'),
        },
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema_view(
    retrieve=extend_schema(
        tags=['Users'],
        summary='Get current user profile',
        description='Returns the profile of the currently authenticated user.',
        responses={
            200: UserSerializer,
            401: OpenApiResponse(description='Authentication credentials were not provided or are invalid.'),
        },
    ),
    update=extend_schema(
        tags=['Users'],
        summary='Update current user profile',
        description="Fully update the authenticated user's username and/or phone.",
        responses={
            200: UserSerializer,
            401: OpenApiResponse(description='Authentication credentials were not provided or are invalid.'),
        },
    ),
    partial_update=extend_schema(
        tags=['Users'],
        summary='Partially update current user profile',
        description='Patch one or more profile fields (username, phone).',
        responses={
            200: UserSerializer,
            401: OpenApiResponse(description='Authentication credentials were not provided or are invalid.'),
        },
    ),
)
class ProfileView(generics.RetrieveUpdateAPIView):
    """Get or update the authenticated user's profile."""

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class SubscribeView(APIView):
    """Activate the Pro plan for the authenticated user (mock payment).

    Accepts card details for *formal validation only*. No real charge is
    performed and card data is never stored. On success, sets the user's
    `is_pro` flag and returns the updated profile.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Users'],
        summary='Purchase the Pro plan (mock)',
        description=(
            'Mock checkout endpoint. Validates the shape of the submitted '
            'card details, makes NO real charge, stores nothing, and '
            'activates the Pro subscription for the current user.'
        ),
        request=SubscribeSerializer,
        examples=[
            OpenApiExample(
                'Payment Example',
                summary='Valid card data',
                value={
                    'card_number': '4242 4242 4242 4242',
                    'card_holder': 'ALMATY TRAVELER',
                    'expiry': '12/30',
                    'cvc': '123',
                },
                request_only=True,
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=UserSerializer,
                description='Payment accepted (mock). Pro plan activated.',
            ),
            400: OpenApiResponse(description='Invalid card details.'),
            401: OpenApiResponse(description='Authentication credentials were not provided or are invalid.'),
        },
    )
    def post(self, request, *args, **kwargs):
        serializer = SubscribeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.is_pro = True
        user.save(update_fields=['is_pro'])

        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)