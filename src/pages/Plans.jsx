import React from 'react';
import { Check, Zap, Crown, TrendingUp } from 'lucide-react';

const Plans = ({ onShowPopup }) => {
    const plans = [
        {
            name: 'Free',
            subtitle: 'Get started',
            price: '₹0',
            period: '',
            description: 'Essential features',
            icon: <Zap size={20} color="#3B82F6" />,
            features: [
                'Limited task creation',
                'Basic reminders',
                'Weekly planner',
                'AI proof verification',
                'Community support'
            ],
            cta: 'Get Started',
            highlighted: false
        },
        {
            name: 'Monthly Pro',
            subtitle: 'Unlock full potential',
            price: '₹299',
            period: '/month',
            description: 'Complete productivity',
            icon: <TrendingUp size={20} color="#8B5CF6" />,
            features: [
                'Unlimited task creation',
                'Smart reminders (time, location, habit)',
                'AI assistants on each task',
                'Weekly + monthly planner',
                'Analytics dashboard',
                'Streak freeze: 2/month',
                'Export to Calendar, Notion, Tasks'
            ],
            cta: 'Start Free Trial',
            highlighted: true,
            badge: 'Most Optimal'
        },
        {
            name: 'Annual Pro',
            subtitle: 'Best value – Save 33%',
            price: '₹199',
            period: '/month',
            savings: 'Save ₹1,200/year',
            description: 'Maximum value',
            icon: <Crown size={20} color="#F59E0B" />,
            features: [
                'Everything in Monthly Pro',
                'Streak freeze: 5/month',
                'Priority support',
                'Golden Badge / Premium Frame',
                'Annual progress PDF export',
                'Beta access to new modules',
                'Exclusive yearly events'
            ],
            cta: 'Get Annual Plan',
            highlighted: false
        }
    ];

    return (
        <div style={{ paddingBottom: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '10px', color: 'hsl(var(--color-text-main))' }}>
                    Choose Your Plan
                </h1>
                <p style={{ fontSize: '15px', color: 'hsl(var(--color-text-secondary))', maxWidth: '500px', margin: '0 auto' }}>
                    Select the perfect plan for your productivity
                </p>
            </div>

            {/* Pricing Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                marginBottom: '28px'
            }}>
                {plans.map((plan, index) => (
                    <div
                        key={index}
                        className="card"
                        style={{
                            position: 'relative',
                            padding: '20px 16px',
                            border: plan.highlighted ? '2px solid #fea100' : '1px solid hsl(var(--color-border))',
                            transform: plan.highlighted ? 'scale(1.04)' : 'scale(1)',
                            transition: 'all 0.3s ease',
                            boxShadow: plan.highlighted ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
                        }}
                    >
                        {/* Badge */}
                        {plan.badge && (
                            <div style={{
                                position: 'absolute',
                                top: '-9px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: '#fea100',
                                color: '#0F172A',
                                padding: '3px 12px',
                                borderRadius: '9px',
                                fontSize: '10px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {plan.badge}
                            </div>
                        )}

                        {/* Icon */}
                        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                            {plan.icon}
                        </div>

                        {/* Plan Name */}
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            marginBottom: '3px',
                            textAlign: 'center',
                            color: 'hsl(var(--color-text-main))'
                        }}>
                            {plan.name}
                        </h3>

                        {/* Subtitle */}
                        <p style={{
                            fontSize: '11px',
                            color: 'hsl(var(--color-text-secondary))',
                            textAlign: 'center',
                            marginBottom: '14px',
                            fontWeight: 500
                        }}>
                            {plan.subtitle}
                        </p>

                        {/* Price */}
                        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '3px', marginBottom: '3px' }}>
                                <span style={{
                                    fontSize: '32px',
                                    fontWeight: 700,
                                    color: 'hsl(var(--color-text-main))'
                                }}>
                                    {plan.price}
                                </span>
                                {plan.period && (
                                    <span style={{
                                        fontSize: '13px',
                                        color: 'hsl(var(--color-text-secondary))'
                                    }}>
                                        {plan.period}
                                    </span>
                                )}
                            </div>
                            {plan.savings && (
                                <div style={{
                                    fontSize: '12px',
                                    color: '#22C55E',
                                    fontWeight: 600
                                }}>
                                    {plan.savings}
                                </div>
                            )}
                        </div>

                        {/* CTA Button */}
                        <button
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: '10px',
                                marginBottom: '16px',
                                fontSize: '13px',
                                background: plan.highlighted ? 'hsl(var(--color-text-main))' : 'hsl(var(--color-bg-input))',
                                color: plan.highlighted ? 'white' : 'hsl(var(--color-text-main))',
                                border: plan.highlighted ? 'none' : '2px solid hsl(var(--color-border))'
                            }}
                            onClick={() => onShowPopup && onShowPopup({
                                title: 'Plan Selected',
                                message: `You selected the ${plan.name} plan. This feature is coming soon!`,
                                type: 'info'
                            })}
                        >
                            {plan.cta}
                        </button>

                        {/* Divider */}
                        <div style={{
                            height: '1px',
                            background: 'hsl(var(--color-border))',
                            marginBottom: '14px'
                        }} />

                        {/* Features List */}
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {plan.features.map((feature, i) => (
                                <li
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '8px',
                                        marginBottom: '8px',
                                        fontSize: '12px',
                                        color: 'hsl(var(--color-text-main))',
                                        lineHeight: '1.4'
                                    }}
                                >
                                    <Check
                                        size={14}
                                        color="#22C55E"
                                        style={{ flexShrink: 0, marginTop: '1px' }}
                                    />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Footer CTA */}
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <p style={{ fontSize: '13px', color: 'hsl(var(--color-text-secondary))' }}>
                    Need help choosing?{' '}
                    <a
                        href="#"
                        style={{
                            color: 'hsl(var(--color-accent-blue))',
                            textDecoration: 'underline',
                            fontWeight: 500
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            onShowPopup && onShowPopup({
                                title: 'Contact Us',
                                message: 'Our support team is here to help! Email us at support@doOrdue.com',
                                type: 'info'
                            });
                        }}
                    >
                        Contact our team
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Plans;
