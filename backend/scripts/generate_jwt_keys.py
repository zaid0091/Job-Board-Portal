import os
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

def generate_keys():
    print("Generating RSA 2048-bit key pair...")
    
    # Generate private key
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    
    # Generate public key
    public_key = private_key.public_key()
    
    # Serialize private key to PEM format
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    ).decode('utf-8')
    
    # Serialize public key to PEM format
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')
    
    print("\n--- BEGIN PRIVATE KEY ---")
    print(private_pem)
    print("--- END PRIVATE KEY ---\n")
    
    print("\n--- BEGIN PUBLIC KEY ---")
    print(public_pem)
    print("--- END PUBLIC KEY ---\n")
    
    print("Please copy the above keys and add them to your .env file as JWT_PRIVATE_KEY and JWT_PUBLIC_KEY.")
    
if __name__ == "__main__":
    generate_keys()
