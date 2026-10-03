-- V5: Seed FAQ knowledge base

INSERT INTO support_faqs (id, category, question, answer, display_order) VALUES
    (uuid_generate_v4(), 'Orders & Shipping', 'How can I track my order?', 'Once your order is shipped, you can track it via the Orders section under your profile with real-time status updates and carrier tracking IDs.', 1),
    (uuid_generate_v4(), 'Orders & Shipping', 'What shipping methods are available?', 'We offer Standard Express (3-5 business days) and Next-Day Priority Delivery. Shipping options and rates are displayed during checkout.', 2),
    (uuid_generate_v4(), 'Orders & Shipping', 'Can I change my delivery address after placing an order?', 'Addresses can be modified within 1 hour of placing the order, provided the status is still PLACED or CONFIRMED.', 3),
    (uuid_generate_v4(), 'Returns & Refunds', 'What is your return policy?', 'Items in original condition with tags intact can be returned within 30 days of delivery. Start a return directly from the order details page.', 1),
    (uuid_generate_v4(), 'Returns & Refunds', 'How long does a refund take?', 'Refunds are initiated immediately upon return package inspection and usually reflect in your bank account within 3-5 business days.', 2),
    (uuid_generate_v4(), 'Payments & Security', 'What payment methods do you accept?', 'We accept all major credit/debit cards (Visa, MasterCard, Amex), UPI, Net Banking, and Aura Wallet.', 1),
    (uuid_generate_v4(), 'Payments & Security', 'How do I enable Two-Factor Authentication (2FA)?', 'Navigate to Profile > Login & Security, click Set up 2FA, scan the QR code with Google Authenticator or 1Password, and enter the 6-digit confirmation code.', 2),
    (uuid_generate_v4(), 'Account & Settings', 'How do I update my email or phone number?', 'Go to Personal Details. Updating email or phone requires a one-time verification code (OTP) sent to the new address/number.', 1),
    (uuid_generate_v4(), 'Account & Settings', 'What happens if I deactivate or delete my account?', 'Account deletion requests enter a 30-day grace period. You can reactivate your account at any time within this period by signing in.', 2);
