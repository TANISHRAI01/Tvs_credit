"""
TVS Sentinel — Synthetic Data Generator
Generates ~5000 loan applications, ~3000 customers, with 5 embedded fraud rings.

Fraud Ring Patterns:
  1. Device Sharing Ring — 8 customers sharing 2 device fingerprints
  2. Guarantor Ring — 1 guarantor backing 7 unrelated applicants
  3. Location Cluster — 10 applications from same GPS but different "addresses"
  4. Dealer Collusion — 1 dealer with abnormally high volume + shared devices
  5. Temporal Burst — 12 applications submitted within 2 hours, linked by phone/device

All data is synthetic. No real PAN/Aadhaar/bank details. Privacy-by-design.
"""

import json
import random
import hashlib
import os
from datetime import datetime, timedelta
from pathlib import Path

# Seed for reproducibility
random.seed(42)

# ── Output directory ──
OUTPUT_DIR = Path(__file__).parent / "generated"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Indian name/location data for realism ──

FIRST_NAMES_MALE = [
    "Rajesh", "Suresh", "Mahesh", "Ramesh", "Ganesh", "Dinesh", "Mukesh",
    "Amit", "Ajay", "Vijay", "Sanjay", "Anil", "Sunil", "Manoj", "Vinod",
    "Pramod", "Ravi", "Kiran", "Ashok", "Deepak", "Rohit", "Nikhil",
    "Sachin", "Rahul", "Arun", "Varun", "Tarun", "Naveen", "Praveen",
    "Vikram", "Vishal", "Pankaj", "Sandeep", "Harish", "Girish", "Satish",
    "Prakash", "Rakesh", "Yogesh", "Umesh", "Hitesh", "Jitesh", "Ritesh",
    "Manish", "Nilesh", "Alpesh", "Paresh", "Kamlesh", "Lokesh", "Brijesh",
    "Arjun", "Krishna", "Shiva", "Mohan", "Sohan", "Rohan", "Kishan",
    "Gopal", "Laxman", "Bharat", "Dheeraj", "Gaurav", "Tushar", "Kunal"
]

FIRST_NAMES_FEMALE = [
    "Priya", "Anjali", "Sunita", "Kavita", "Savita", "Mamta", "Seema",
    "Neha", "Pooja", "Asha", "Usha", "Rekha", "Lata", "Sita", "Geeta",
    "Meena", "Reena", "Sheena", "Naina", "Ritu", "Swati", "Preeti",
    "Deepa", "Shobha", "Sneha", "Divya", "Shruti", "Pallavi", "Manali",
    "Ranjana", "Sarita", "Anita", "Babita", "Vandana", "Archana", "Kanchan"
]

LAST_NAMES = [
    "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Joshi",
    "Mishra", "Pandey", "Tiwari", "Dubey", "Srivastava", "Agarwal",
    "Jain", "Shah", "Mehta", "Chauhan", "Yadav", "Thakur", "Rajput",
    "Reddy", "Naidu", "Rao", "Nair", "Menon", "Pillai", "Iyer",
    "Mukherjee", "Banerjee", "Chatterjee", "Bose", "Das", "Sen",
    "Patil", "Kulkarni", "Deshmukh", "Jadhav", "More", "Pawar",
    "Choudhary", "Saxena", "Malhotra", "Kapoor", "Arora", "Bhatia"
]

CITIES = [
    ("Mumbai", "Maharashtra", 19.076, 72.877),
    ("Delhi", "Delhi", 28.704, 77.102),
    ("Bangalore", "Karnataka", 12.971, 77.594),
    ("Chennai", "Tamil Nadu", 13.082, 80.270),
    ("Hyderabad", "Telangana", 17.385, 78.486),
    ("Pune", "Maharashtra", 18.520, 73.856),
    ("Ahmedabad", "Gujarat", 23.022, 72.571),
    ("Kolkata", "West Bengal", 22.572, 88.363),
    ("Jaipur", "Rajasthan", 26.912, 75.787),
    ("Lucknow", "Uttar Pradesh", 26.846, 80.946),
    ("Coimbatore", "Tamil Nadu", 11.016, 76.955),
    ("Madurai", "Tamil Nadu", 9.925, 78.119),
    ("Nagpur", "Maharashtra", 21.145, 79.088),
    ("Indore", "Madhya Pradesh", 22.719, 75.857),
    ("Bhopal", "Madhya Pradesh", 23.259, 77.412),
    ("Patna", "Bihar", 25.610, 85.144),
    ("Varanasi", "Uttar Pradesh", 25.317, 82.987),
    ("Surat", "Gujarat", 21.170, 72.831),
    ("Kanpur", "Uttar Pradesh", 26.449, 80.331),
    ("Agra", "Uttar Pradesh", 27.176, 78.008),
    ("Thiruvananthapuram", "Kerala", 8.524, 76.936),
    ("Kochi", "Kerala", 9.931, 76.267),
    ("Visakhapatnam", "Andhra Pradesh", 17.686, 83.218),
    ("Ranchi", "Jharkhand", 23.344, 85.309),
    ("Mysuru", "Karnataka", 12.295, 76.639),
]

TIER_2_3_TOWNS = [
    ("Hosur", "Tamil Nadu", 12.736, 77.832),
    ("Tiruchirappalli", "Tamil Nadu", 10.790, 78.704),
    ("Salem", "Tamil Nadu", 11.664, 78.146),
    ("Vellore", "Tamil Nadu", 12.916, 79.132),
    ("Thanjavur", "Tamil Nadu", 10.787, 79.137),
    ("Erode", "Tamil Nadu", 11.341, 77.717),
    ("Tirunelveli", "Tamil Nadu", 8.713, 77.756),
    ("Hubli", "Karnataka", 15.364, 75.124),
    ("Belgaum", "Karnataka", 15.849, 74.497),
    ("Gulbarga", "Karnataka", 17.329, 76.834),
    ("Nanded", "Maharashtra", 19.160, 77.315),
    ("Solapur", "Maharashtra", 17.659, 75.910),
    ("Akola", "Maharashtra", 20.707, 77.002),
    ("Aligarh", "Uttar Pradesh", 27.881, 78.078),
    ("Bareilly", "Uttar Pradesh", 28.367, 79.432),
    ("Gorakhpur", "Uttar Pradesh", 26.760, 83.373),
    ("Udaipur", "Rajasthan", 24.585, 73.712),
    ("Jodhpur", "Rajasthan", 26.238, 73.024),
    ("Kota", "Rajasthan", 25.180, 75.864),
    ("Ajmer", "Rajasthan", 26.449, 74.639),
]

ALL_LOCATIONS = CITIES + TIER_2_3_TOWNS

DEALER_NAMES = [
    "Sharma Motors", "Patel Auto World", "Singh Wheels", "Gupta Two Wheelers",
    "Reddy Motors", "Kumar Automobiles", "Verma Auto", "Jain Motor Works",
    "Thakur Vehicles", "Chauhan Motors", "Rao Auto Center", "Mishra Bikes",
    "Agarwal Motors", "Pillai Auto", "Das Motor Hub", "Patil Two Wheelers",
    "Kapoor Auto Zone", "Mehta Motors", "Rajput Wheels", "Nair Auto World",
    "TVS Authorized - Central", "TVS Authorized - East", "TVS Authorized - West",
    "TVS Authorized - South", "TVS Authorized - North", "Royal Auto Hub",
    "Speed Motors", "City Auto Center", "Highway Motors", "Golden Wheels",
    "Star Auto World", "Diamond Motors", "Silver Auto Zone", "Platinum Bikes",
    "Metro Motor Hub", "Urban Wheels", "Rural Auto Center", "Village Motors",
    "Town Auto Works", "District Motor Hub",
]

LOAN_TYPES = [
    "Two Wheeler Loan", "Used Car Loan", "Three Wheeler Loan",
    "Tractor Loan", "Consumer Durable Loan", "Personal Loan",
    "Used Commercial Vehicle Loan", "Gold Loan",
]

BANK_NAMES = [
    "SBI", "HDFC", "ICICI", "PNB", "BOB", "Axis", "Kotak",
    "Canara", "Union", "BOI", "Indian Bank", "Central Bank",
    "UCO Bank", "IDBI", "Federal Bank", "South Indian Bank",
    "Karur Vysya Bank", "City Union Bank", "TMB", "KVB",
]


# ── Helper Functions ──

def generate_id(prefix: str, index: int) -> str:
    """Generate a unique ID like CUST_00001, DEV_00042."""
    return f"{prefix}_{str(index).zfill(5)}"


def generate_phone() -> str:
    """Generate a realistic Indian mobile number."""
    prefixes = ["98", "97", "96", "95", "94", "93", "91", "90", "89", "88",
                "87", "86", "85", "84", "83", "82", "81", "80", "79", "78",
                "77", "76", "75", "74", "73", "72", "71", "70"]
    return random.choice(prefixes) + "".join([str(random.randint(0, 9)) for _ in range(8)])


def generate_device_fingerprint() -> str:
    """Generate a hashed device fingerprint."""
    raw = f"device_{random.randint(100000, 999999)}_{random.randint(0, 9999)}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def generate_bank_account() -> str:
    """Generate a pseudonymized bank account number."""
    bank = random.choice(BANK_NAMES)
    num = "".join([str(random.randint(0, 9)) for _ in range(12)])
    return f"{bank}-XXXX{num[-4:]}"


def generate_name() -> str:
    """Generate a random Indian name."""
    if random.random() < 0.65:
        first = random.choice(FIRST_NAMES_MALE)
    else:
        first = random.choice(FIRST_NAMES_FEMALE)
    last = random.choice(LAST_NAMES)
    return f"{first} {last}"


def generate_address(city_data: tuple) -> str:
    """Generate a realistic Indian address."""
    city, state, lat, lng = city_data
    street_num = random.randint(1, 500)
    areas = ["Sector", "Block", "Phase", "Ward", "Colony", "Nagar", "Layout",
             "Extension", "Main Road", "Cross Street"]
    area = random.choice(areas)
    area_num = random.randint(1, 50)
    return f"{street_num}, {area} {area_num}, {city}, {state}"


# ── Main Data Generation ──

def generate_customers(count: int = 3000) -> list[dict]:
    """Generate customer records."""
    customers = []
    for i in range(1, count + 1):
        city_data = random.choice(ALL_LOCATIONS)
        customers.append({
            "id": generate_id("CUST", i),
            "name": generate_name(),
            "phone": generate_phone(),
            "address": generate_address(city_data),
            "city": city_data[0],
            "state": city_data[1],
            "lat": city_data[2] + random.uniform(-0.05, 0.05),
            "lng": city_data[3] + random.uniform(-0.05, 0.05),
            "created_at": (datetime(2024, 1, 1) + timedelta(days=random.randint(0, 600))).isoformat(),
        })
    return customers


def generate_dealers(count: int = 40) -> list[dict]:
    """Generate dealer records."""
    dealers = []
    for i in range(1, count + 1):
        city_data = random.choice(ALL_LOCATIONS)
        dealers.append({
            "id": generate_id("DLR", i),
            "name": DEALER_NAMES[i - 1] if i <= len(DEALER_NAMES) else f"Dealer {i}",
            "city": city_data[0],
            "state": city_data[1],
            "lat": city_data[2] + random.uniform(-0.02, 0.02),
            "lng": city_data[3] + random.uniform(-0.02, 0.02),
            "total_applications": 0,  # will be updated
            "default_rate": round(random.uniform(0.02, 0.08), 3),
        })
    return dealers


def generate_loan_applications(
    customers: list[dict],
    dealers: list[dict],
    count: int = 5000
) -> tuple[list[dict], list[dict], list[dict]]:
    """
    Generate loan applications with devices, guarantors, and bank accounts.
    Returns: (applications, devices, guarantors)
    """
    applications = []
    devices_map = {}  # fingerprint -> device record
    guarantors_map = {}  # guarantor_id -> guarantor record
    
    # Pre-generate some device fingerprints (most customers have unique devices)
    device_pool = [generate_device_fingerprint() for _ in range(2500)]
    
    # Pre-generate some guarantor IDs (some guarantors back multiple people)
    guarantor_pool = []
    for i in range(1, 800):
        guarantor_pool.append({
            "id": generate_id("GUAR", i),
            "name": generate_name(),
            "phone": generate_phone(),
            "relationship": random.choice(["Father", "Mother", "Spouse", "Brother",
                                            "Sister", "Friend", "Colleague", "Employer"]),
        })

    base_date = datetime(2024, 6, 1)

    for i in range(1, count + 1):
        customer = random.choice(customers)
        dealer = random.choice(dealers)
        guarantor = random.choice(guarantor_pool)
        device_fp = random.choice(device_pool)
        
        # Track devices
        if device_fp not in devices_map:
            devices_map[device_fp] = {
                "id": f"DEV_{device_fp[:8]}",
                "fingerprint": device_fp,
                "user_count": 0,
                "applications": [],
            }
        devices_map[device_fp]["user_count"] += 1
        devices_map[device_fp]["applications"].append(generate_id("APP", i))

        # Track guarantors
        if guarantor["id"] not in guarantors_map:
            guarantors_map[guarantor["id"]] = {**guarantor, "backed_count": 0, "backed_applications": []}
        guarantors_map[guarantor["id"]]["backed_count"] += 1
        guarantors_map[guarantor["id"]]["backed_applications"].append(generate_id("APP", i))

        # Update dealer stats
        dealer["total_applications"] += 1

        # Application timestamp (spread over ~18 months)
        app_date = base_date + timedelta(
            days=random.randint(0, 540),
            hours=random.randint(8, 20),
            minutes=random.randint(0, 59)
        )

        loan_type = random.choice(LOAN_TYPES)
        if loan_type == "Two Wheeler Loan":
            amount = round(random.uniform(30000, 200000), -2)
        elif loan_type == "Used Car Loan":
            amount = round(random.uniform(200000, 1000000), -2)
        elif loan_type == "Tractor Loan":
            amount = round(random.uniform(300000, 1500000), -2)
        elif loan_type == "Personal Loan":
            amount = round(random.uniform(20000, 500000), -2)
        elif loan_type == "Gold Loan":
            amount = round(random.uniform(10000, 300000), -2)
        else:
            amount = round(random.uniform(50000, 500000), -2)

        # Payment status (most are good, some defaulted)
        payment_status = random.choices(
            ["current", "late_30", "late_60", "late_90", "default"],
            weights=[70, 12, 8, 5, 5],
            k=1
        )[0]

        applications.append({
            "id": generate_id("APP", i),
            "customer_id": customer["id"],
            "customer_name": customer["name"],
            "phone": customer["phone"],
            "device_fingerprint": device_fp,
            "dealer_id": dealer["id"],
            "dealer_name": dealer["name"],
            "guarantor_id": guarantor["id"],
            "guarantor_name": guarantor["name"],
            "bank_account": generate_bank_account(),
            "location": customer["city"],
            "lat": customer["lat"],
            "lng": customer["lng"],
            "loan_type": loan_type,
            "loan_amount": amount,
            "status": random.choice(["approved", "pending", "rejected"]),
            "payment_status": payment_status,
            "submitted_at": app_date.isoformat(),
            "emi_amount": round(amount / random.choice([12, 18, 24, 36]), 2),
        })

    devices = list(devices_map.values())
    guarantors = list(guarantors_map.values())

    return applications, devices, guarantors


# ── Fraud Ring Injection ──

def inject_fraud_ring_1_device_sharing(applications: list, devices_map: dict) -> dict:
    """
    FRAUD RING 1: Device Sharing Ring
    8 different customers share 2 device fingerprints.
    These customers appear unrelated (different names, addresses) but use same devices.
    """
    ring_device_1 = "FRAUD_DEV_ALPHA_01"
    ring_device_2 = "FRAUD_DEV_ALPHA_02"
    ring_apps = []
    
    base_date = datetime(2025, 3, 1)
    
    for i in range(8):
        app_id = generate_id("APP", 5001 + i)
        device = ring_device_1 if i < 5 else ring_device_2
        city_data = random.choice(ALL_LOCATIONS)
        
        ring_apps.append({
            "id": app_id,
            "customer_id": generate_id("CUST", 3001 + i),
            "customer_name": generate_name(),
            "phone": generate_phone(),
            "device_fingerprint": device,
            "dealer_id": random.choice(["DLR_00005", "DLR_00012", "DLR_00018"]),
            "dealer_name": "Various",
            "guarantor_id": generate_id("GUAR", 801 + i),
            "guarantor_name": generate_name(),
            "bank_account": generate_bank_account(),
            "location": city_data[0],
            "lat": city_data[2] + random.uniform(-0.01, 0.01),
            "lng": city_data[3] + random.uniform(-0.01, 0.01),
            "loan_type": "Two Wheeler Loan",
            "loan_amount": round(random.uniform(80000, 150000), -2),
            "status": "approved",
            "payment_status": random.choice(["late_60", "late_90", "default"]),
            "submitted_at": (base_date + timedelta(days=random.randint(0, 30))).isoformat(),
            "emi_amount": round(random.uniform(3000, 6000), 2),
        })
    
    applications.extend(ring_apps)
    return {
        "ring_id": "RING_001",
        "type": "device_sharing",
        "description": "8 customers sharing 2 device fingerprints — appears coordinated",
        "application_ids": [a["id"] for a in ring_apps],
        "shared_devices": [ring_device_1, ring_device_2],
        "risk_score": 87,
    }


def inject_fraud_ring_2_guarantor(applications: list) -> dict:
    """
    FRAUD RING 2: Guarantor Ring
    1 guarantor backing 7 completely unrelated applicants across different cities.
    """
    ring_guarantor_id = "GUAR_RING_002"
    ring_guarantor_name = "Vikram Malhotra"
    ring_apps = []
    
    base_date = datetime(2025, 1, 15)
    cities_used = random.sample(ALL_LOCATIONS, 7)
    
    for i in range(7):
        app_id = generate_id("APP", 5020 + i)
        city_data = cities_used[i]
        
        ring_apps.append({
            "id": app_id,
            "customer_id": generate_id("CUST", 3020 + i),
            "customer_name": generate_name(),
            "phone": generate_phone(),
            "device_fingerprint": generate_device_fingerprint(),
            "dealer_id": generate_id("DLR", random.randint(1, 40)),
            "dealer_name": "Various",
            "guarantor_id": ring_guarantor_id,
            "guarantor_name": ring_guarantor_name,
            "bank_account": generate_bank_account(),
            "location": city_data[0],
            "lat": city_data[2] + random.uniform(-0.01, 0.01),
            "lng": city_data[3] + random.uniform(-0.01, 0.01),
            "loan_type": random.choice(["Two Wheeler Loan", "Personal Loan", "Used Car Loan"]),
            "loan_amount": round(random.uniform(100000, 500000), -2),
            "status": "approved",
            "payment_status": random.choice(["late_30", "late_60", "late_90", "default"]),
            "submitted_at": (base_date + timedelta(days=random.randint(0, 60))).isoformat(),
            "emi_amount": round(random.uniform(4000, 15000), 2),
        })
    
    applications.extend(ring_apps)
    return {
        "ring_id": "RING_002",
        "type": "guarantor_ring",
        "description": f"Guarantor '{ring_guarantor_name}' backing 7 unrelated applicants across 7 cities",
        "application_ids": [a["id"] for a in ring_apps],
        "shared_guarantor": ring_guarantor_id,
        "risk_score": 92,
    }


def inject_fraud_ring_3_location_cluster(applications: list) -> dict:
    """
    FRAUD RING 3: Location Cluster
    10 applications from the same GPS coordinates but claiming different addresses.
    """
    # All share the same actual location (Hosur, Tamil Nadu)
    center_lat = 12.736
    center_lng = 77.832
    ring_apps = []
    
    base_date = datetime(2025, 5, 1)
    
    for i in range(10):
        app_id = generate_id("APP", 5040 + i)
        
        ring_apps.append({
            "id": app_id,
            "customer_id": generate_id("CUST", 3040 + i),
            "customer_name": generate_name(),
            "phone": generate_phone(),
            "device_fingerprint": generate_device_fingerprint(),
            "dealer_id": "DLR_00008",  # Same dealer
            "dealer_name": "Chauhan Motors",
            "guarantor_id": generate_id("GUAR", 830 + (i % 3)),  # 3 shared guarantors
            "guarantor_name": generate_name(),
            "bank_account": generate_bank_account(),
            "location": f"Location_{random.randint(1,99)}, Hosur",  # Different "addresses"
            "lat": center_lat + random.uniform(-0.002, 0.002),  # Very tight cluster
            "lng": center_lng + random.uniform(-0.002, 0.002),
            "loan_type": "Two Wheeler Loan",
            "loan_amount": round(random.uniform(60000, 120000), -2),
            "status": "approved",
            "payment_status": random.choice(["late_60", "late_90", "default"]),
            "submitted_at": (base_date + timedelta(days=random.randint(0, 14))).isoformat(),
            "emi_amount": round(random.uniform(2500, 5000), 2),
        })
    
    applications.extend(ring_apps)
    return {
        "ring_id": "RING_003",
        "type": "location_cluster",
        "description": "10 applications from same GPS location (~200m radius) with different addresses via same dealer",
        "application_ids": [a["id"] for a in ring_apps],
        "center_location": {"lat": center_lat, "lng": center_lng, "city": "Hosur"},
        "risk_score": 78,
    }


def inject_fraud_ring_4_dealer_collusion(applications: list) -> dict:
    """
    FRAUD RING 4: Dealer Collusion
    A dealer processing many applications with shared devices and high default rate.
    """
    colluding_dealer_id = "DLR_00033"
    colluding_dealer_name = "Platinum Bikes"
    shared_device = "FRAUD_DEV_DEALER_RING"
    ring_apps = []
    
    base_date = datetime(2025, 2, 1)
    city_data = ("Indore", "Madhya Pradesh", 22.719, 75.857)
    
    for i in range(12):
        app_id = generate_id("APP", 5060 + i)
        # Half share the same device, rest have unique
        device = shared_device if i < 6 else generate_device_fingerprint()
        
        ring_apps.append({
            "id": app_id,
            "customer_id": generate_id("CUST", 3060 + i),
            "customer_name": generate_name(),
            "phone": generate_phone(),
            "device_fingerprint": device,
            "dealer_id": colluding_dealer_id,
            "dealer_name": colluding_dealer_name,
            "guarantor_id": generate_id("GUAR", 840 + (i % 4)),  # 4 rotating guarantors
            "guarantor_name": generate_name(),
            "bank_account": generate_bank_account(),
            "location": city_data[0],
            "lat": city_data[2] + random.uniform(-0.01, 0.01),
            "lng": city_data[3] + random.uniform(-0.01, 0.01),
            "loan_type": random.choice(["Two Wheeler Loan", "Three Wheeler Loan"]),
            "loan_amount": round(random.uniform(70000, 200000), -2),
            "status": "approved",
            "payment_status": random.choice(["late_90", "default"]),  # High default rate
            "submitted_at": (base_date + timedelta(days=random.randint(0, 45))).isoformat(),
            "emi_amount": round(random.uniform(3000, 8000), 2),
        })
    
    applications.extend(ring_apps)
    return {
        "ring_id": "RING_004",
        "type": "dealer_collusion",
        "description": f"Dealer '{colluding_dealer_name}' processing 12 apps with shared devices and 100% late/default rate",
        "application_ids": [a["id"] for a in ring_apps],
        "colluding_dealer": colluding_dealer_id,
        "shared_device": shared_device,
        "risk_score": 94,
    }


def inject_fraud_ring_5_temporal_burst(applications: list) -> dict:
    """
    FRAUD RING 5: Temporal Burst
    12 applications submitted within a 2-hour window, sharing phone prefixes and a device.
    Simulates an emerging fraud ecosystem forming over 12 days.
    """
    ring_apps = []
    shared_phone_prefix = "98765"
    shared_device = "FRAUD_DEV_TEMPORAL"
    
    # This ring forms gradually — simulating the Day 1 → Day 12 emerging pattern
    formation_start = datetime(2025, 7, 1)
    
    for i in range(12):
        app_id = generate_id("APP", 5080 + i)
        city_data = random.choice([
            ("Chennai", "Tamil Nadu", 13.082, 80.270),
            ("Coimbatore", "Tamil Nadu", 11.016, 76.955),
        ])
        
        # Gradually add more connections as the ring forms
        if i < 3:
            device = generate_device_fingerprint()  # First apps look normal
            phone = generate_phone()
        elif i < 6:
            device = shared_device if random.random() < 0.5 else generate_device_fingerprint()
            phone = shared_phone_prefix + "".join([str(random.randint(0, 9)) for _ in range(5)])
        else:
            device = shared_device  # Later apps clearly connected
            phone = shared_phone_prefix + "".join([str(random.randint(0, 9)) for _ in range(5)])
        
        ring_apps.append({
            "id": app_id,
            "customer_id": generate_id("CUST", 3080 + i),
            "customer_name": generate_name(),
            "phone": phone,
            "device_fingerprint": device,
            "dealer_id": random.choice(["DLR_00003", "DLR_00015"]),
            "dealer_name": "Various",
            "guarantor_id": generate_id("GUAR", 850 + (i % 3)),
            "guarantor_name": generate_name(),
            "bank_account": generate_bank_account(),
            "location": city_data[0],
            "lat": city_data[2] + random.uniform(-0.01, 0.01),
            "lng": city_data[3] + random.uniform(-0.01, 0.01),
            "loan_type": "Two Wheeler Loan",
            "loan_amount": round(random.uniform(80000, 160000), -2),
            "status": random.choice(["approved", "pending"]),
            "payment_status": random.choice(["current", "late_30", "late_60"]),
            "submitted_at": (formation_start + timedelta(days=i)).isoformat(),  # One per day
            "emi_amount": round(random.uniform(3500, 6500), 2),
        })
    
    applications.extend(ring_apps)
    return {
        "ring_id": "RING_005",
        "type": "temporal_burst",
        "description": "12 applications over 12 days with gradually emerging connections — shared devices, phone patterns, guarantors",
        "application_ids": [a["id"] for a in ring_apps],
        "formation_timeline": [
            {"day": 1, "event": "First suspicious application", "description": "Application CUST_03080 submitted"},
            {"day": 2, "event": "Second application", "description": "Unrelated customer, different device"},
            {"day": 3, "event": "Third application", "description": "New customer, pattern not yet visible"},
            {"day": 4, "event": "Phone pattern detected", "description": "Shared phone prefix 98765 appears"},
            {"day": 5, "event": "Device overlap", "description": "Shared device fingerprint first seen"},
            {"day": 6, "event": "Shared device + phone", "description": "Two connections now visible"},
            {"day": 7, "event": "Guarantor link", "description": "Same guarantor backing 3rd applicant"},
            {"day": 8, "event": "Dealer pattern", "description": "Same 2 dealers processing all apps"},
            {"day": 9, "event": "Network forming", "description": "6 entities now connected"},
            {"day": 10, "event": "Location cluster", "description": "All recent apps from Chennai/Coimbatore"},
            {"day": 11, "event": "Risk escalation", "description": "Network risk score crosses threshold"},
            {"day": 12, "event": "EMERGING FRAUD ECOSYSTEM", "description": "Full network identified with 12 connected applications"},
        ],
        "risk_score": 82,
    }


def generate_all_data():
    """Main function to generate all synthetic data."""
    print("🔧 Generating TVS Sentinel synthetic data...")
    
    # Step 1: Generate base data
    print("  → Generating 3000 customers...")
    customers = generate_customers(3000)
    
    print("  → Generating 40 dealers...")
    dealers = generate_dealers(40)
    
    print("  → Generating 5000 loan applications...")
    applications, devices, guarantors = generate_loan_applications(customers, dealers, 5000)
    
    # Step 2: Inject fraud rings
    print("  → Injecting Fraud Ring 1: Device Sharing (8 customers, 2 devices)...")
    ring1 = inject_fraud_ring_1_device_sharing(applications, {})
    
    print("  → Injecting Fraud Ring 2: Guarantor Ring (1 guarantor, 7 applicants)...")
    ring2 = inject_fraud_ring_2_guarantor(applications)
    
    print("  → Injecting Fraud Ring 3: Location Cluster (10 apps, same GPS)...")
    ring3 = inject_fraud_ring_3_location_cluster(applications)
    
    print("  → Injecting Fraud Ring 4: Dealer Collusion (12 apps, shared devices)...")
    ring4 = inject_fraud_ring_4_dealer_collusion(applications)
    
    print("  → Injecting Fraud Ring 5: Temporal Burst (12 apps, emerging ecosystem)...")
    ring5 = inject_fraud_ring_5_temporal_burst(applications)
    
    fraud_rings_metadata = [ring1, ring2, ring3, ring4, ring5]
    
    # Step 3: Save everything
    print("  → Saving data to JSON files...")
    
    data_files = {
        "customers.json": customers,
        "dealers.json": dealers,
        "applications.json": applications,
        "devices.json": devices,
        "guarantors.json": guarantors,
        "fraud_rings_ground_truth.json": fraud_rings_metadata,
    }
    
    for filename, data in data_files.items():
        filepath = OUTPUT_DIR / filename
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        print(f"    ✅ {filename}: {len(data)} records")
    
    # Summary
    total_apps = len(applications)
    fraud_apps = sum(len(r["application_ids"]) for r in fraud_rings_metadata)
    
    print(f"\n📊 Data Generation Summary:")
    print(f"   Total Customers:      {len(customers)}")
    print(f"   Total Dealers:        {len(dealers)}")
    print(f"   Total Applications:   {total_apps}")
    print(f"   Total Devices:        {len(devices)}")
    print(f"   Total Guarantors:     {len(guarantors)}")
    print(f"   Fraud Rings:          {len(fraud_rings_metadata)}")
    print(f"   Fraudulent Apps:      {fraud_apps} ({fraud_apps/total_apps*100:.1f}%)")
    print(f"\n✅ All data saved to: {OUTPUT_DIR.resolve()}")


if __name__ == "__main__":
    generate_all_data()
