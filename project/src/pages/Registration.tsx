import React, { useState } from 'react';

const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Basic features, limited customization, community tips.',
    features: [
      'Basic task tracking',
      'Daily reminders',
      'Limited history',
      'Community tips',
    ],
    color: 'bg-blue-100',
  },
  {
    id: 'paid',
    name: 'Paid',
    description: 'All core features, no ads, more customization, export data.',
    features: [
      'All Free features',
      'Unlimited history',
      'Custom themes',
      'Export data',
      'No ads',
    ],
    color: 'bg-green-100',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Paid More',
    description: 'Everything in Paid, plus advanced analytics, integrations, priority support.',
    features: [
      'All Paid features',
      'Advanced analytics',
      'Integrations',
      'Priority support',
    ],
    color: 'bg-yellow-100',
    bestValue: true,
  },
];

const Registration: React.FC = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    plan: 'free',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlanSelect = (plan: string) => {
    setForm({ ...form, plan });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: handle registration logic here
    alert(`Registered as ${form.name} (${form.email}) with plan: ${form.plan}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-2">Welcome to FocusFlow!</h1>
        <p className="text-center text-gray-500 mb-6">Track, focus, and thrive with ADHD.</p>
        <div className="w-full flex justify-center mb-4">
          <div className="flex gap-2">
            <div className={`h-2 w-8 rounded-full ${step === 1 ? 'bg-indigo-500' : 'bg-gray-200'}`}></div>
            <div className={`h-2 w-8 rounded-full ${step === 2 ? 'bg-indigo-500' : 'bg-gray-200'}`}></div>
          </div>
        </div>
        {step === 1 && (
          <form onSubmit={e => { e.preventDefault(); setStep(2); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-500 text-white py-2 rounded-md font-semibold hover:bg-indigo-600 transition"
            >
              Next
            </button>
            <p className="text-center text-sm mt-2">
              Already have an account? <span className="text-indigo-500 underline cursor-pointer">Log in</span>
            </p>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold text-center mb-2">Choose your plan</h2>
            <div className="flex flex-col gap-4">
              {plans.map(plan => (
                <div
                  key={plan.id}
                  className={`rounded-lg p-4 border-2 cursor-pointer transition-all ${form.plan === plan.id ? 'border-indigo-500 ring-2 ring-indigo-300' : 'border-gray-200'} ${plan.color}`}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-lg">{plan.name}</span>
                    {plan.popular && <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">Most Popular</span>}
                    {plan.bestValue && <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">Best Value</span>}
                  </div>
                  <p className="text-gray-600 mb-2">{plan.description}</p>
                  <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                    {plan.features.map(f => <li key={f}>{f}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-500 text-white py-2 rounded-md font-semibold hover:bg-indigo-600 transition"
            >
              {form.plan === 'free' ? 'Start Free' : 'Start Free Trial'}
            </button>
            <button
              type="button"
              className="w-full text-indigo-500 underline mt-2"
              onClick={() => setStep(1)}
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Registration; 