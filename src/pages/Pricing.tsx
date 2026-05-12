import React from 'react';
import { Check, Zap, Sparkles, Crown, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: '0',
      icon: Zap,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      description: 'Perfect for small local businesses starting out.',
      features: [
        '5 AI Generations per month',
        'Standard Quality Posters',
        'Basic Captions & Hashtags',
        'Community Support'
      ]
    },
    {
      name: 'Professional',
      price: '999',
      icon: Sparkles,
      color: 'text-brand-600',
      bgColor: 'bg-brand-50',
      popular: true,
      description: 'Best for growing businesses with active social media.',
      features: [
        '50 AI Generations per month',
        'Premium 4K Posters',
        'Advanced SEO Captions',
        'Priority Email Support',
        'No Watermark',
        'Brand Profile Customization'
      ]
    },
    {
      name: 'Enterprise',
      price: '2499',
      icon: Crown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'For agencies and large scale marketing teams.',
      features: [
        'Unlimited AI Generations',
        'Custom Brand Templates',
        'Dedicated Account Manager',
        'API Access for Automation',
        'Team Collaboration Tools',
        'White-label Reports'
      ]
    }
  ];

  const handleSubscribe = async (plan: string) => {
    if (plan === 'Starter') return;

    try {
      const res = await axios.post('/api/payments/create-order', {
        amount: plan === 'Professional' ? 999 : 2499
      });
      
      const options = {
        key: 'rzp_test_SVuK3PysjaiJlz',
        amount: res.data.amount,
        currency: res.data.currency,
        name: 'LocalBoost AI',
        description: `${plan} Subscription`,
        order_id: res.data.id,
        handler: function (response: any) {
          toast.success('Payment successful! Welcome to ' + plan);
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com'
        },
        theme: {
          color: '#0F172A'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Failed to initiate payment');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 font-sans selection:bg-brand-100 selection:text-brand-700">
      <header className="text-center max-w-3xl mx-auto space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold uppercase tracking-widest"
        >
          <Zap size={12} />
          Pricing Plans
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">Simple, Transparent Pricing</h1>
        <p className="text-slate-500 text-lg font-medium">Choose the plan that fits your business needs. No hidden fees, cancel anytime.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative premium-card p-8 flex flex-col h-full transition-all hover:scale-[1.02] ${
              plan.popular ? 'border-brand-500 ring-4 ring-brand-500/5 shadow-2xl shadow-brand-500/10' : 'border-slate-100'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                Most Popular
              </div>
            )}

            <div className="flex items-center justify-between mb-8">
              <div className={`${plan.bgColor} w-12 h-12 rounded-2xl flex items-center justify-center ${plan.color} shadow-sm`}>
                <plan.icon size={24} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">₹{plan.price}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">per month</div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{plan.description}</p>
            </div>

            <ul className="space-y-4 mb-10 flex-grow">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                  <div className="w-5 h-5 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.name)}
              className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
                plan.popular
                  ? 'btn-primary shadow-xl shadow-brand-500/20'
                  : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {plan.name === 'Starter' ? 'Current Plan' : (
                <>
                  Get Started
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="premium-card p-8 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl font-bold">Need a custom solution?</h3>
          <p className="text-slate-400 text-sm font-medium">We offer tailored plans for large franchises and multi-location businesses.</p>
        </div>
        <button className="btn-secondary bg-white text-slate-900 hover:bg-slate-100 border-transparent whitespace-nowrap">
          Contact Sales
        </button>
      </div>
    </div>
  );
}
