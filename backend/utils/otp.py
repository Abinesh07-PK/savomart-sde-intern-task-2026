import random

def generate_mock_otp() -> str:
    """
    Generates a secure mock 6-digit OTP code for the development environment.
    """
    return "".join(str(random.randint(0, 9)) for _ in range(6))
