'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { PageHeader } from '@/components/page-header';
import { User, Package, LogOut, Loader2, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Country, State, City } from 'country-state-city';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateProfile, fetchProfile } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Billing Address State
  const [country, setCountry] = useState('US');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  // Shipping Address State
  const [shippingCountry, setShippingCountry] = useState('US');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingApartment, setShippingApartment] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingZip, setShippingZip] = useState('');

  const [sameAddress, setSameAddress] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    setIsMounted(true);
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');

      try {
        if (user.permanentAddress) {
          const billing = JSON.parse(user.permanentAddress);
          setCountry(billing.country || 'US');
          setAddress(billing.address || '');
          setApartment(billing.apartment || '');
          setCity(billing.city || '');
          setState(billing.state || '');
          setZip(billing.zip || '');
        }
      } catch (e) {
        setAddress(user.permanentAddress || '');
      }

      try {
        if (user.shippingAddress) {
          const shipping = JSON.parse(user.shippingAddress);
          setShippingCountry(shipping.country || 'US');
          setShippingAddress(shipping.address || '');
          setShippingApartment(shipping.apartment || '');
          setShippingCity(shipping.city || '');
          setShippingState(shipping.state || '');
          setShippingZip(shipping.zip || '');
        }
      } catch (e) {
        setShippingAddress(user.shippingAddress || '');
      }

      setSameAddress(
        !!user.permanentAddress && user.permanentAddress === user.shippingAddress
      );
    }
  }, [user]);

  if (!isMounted) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  if (!isAuthenticated || !user) {
    router.replace('/login');
    return null;
  }

  // Derived state for Country-State-City
  const billingStates = country ? State.getStatesOfCountry(country) : [];
  const billingCities = state ? City.getCitiesOfState(country, state) : [];

  const shippingStates = shippingCountry ? State.getStatesOfCountry(shippingCountry) : [];
  const shippingCities = shippingState ? City.getCitiesOfState(shippingCountry, shippingState) : [];

  const handleSameAddressChange = (checked: boolean) => {
    setSameAddress(checked);
    if (checked) {
      setShippingCountry(country);
      setShippingAddress(address);
      setShippingApartment(apartment);
      setShippingCity(city);
      setShippingState(state);
      setShippingZip(zip);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const billingJSON = JSON.stringify({
        country, address, apartment, city, state, zip
      });

      let shippingJSON = '';
      if (sameAddress) {
        shippingJSON = billingJSON;
      } else {
        shippingJSON = JSON.stringify({
          country: shippingCountry,
          address: shippingAddress,
          apartment: shippingApartment,
          city: shippingCity,
          state: shippingState,
          zip: shippingZip
        });
      }

      await updateProfile({
        name,
        email,
        phone,
        permanentAddress: billingJSON,
        shippingAddress: shippingJSON
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      if (!err.response) {
        toast.error(err.message || 'Failed to update profile.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="bg-muted min-h-screen pb-24">
      <PageHeader
        title="My Account"
        eyebrow="Profile"
        icon={User}
        imageSrc="/page_heaer.png"
      />

      <div className="mx-auto max-w-6xl px-6 pt-16">
        <div className="grid md:grid-cols-[250px_1fr] gap-10">

          {/* Sidebar Menu */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-border/60 h-fit space-y-2">
            <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted text-primary font-medium text-sm transition-colors">
              <User className="w-4 h-4" />
              Profile Info
            </Link>
            <Link href="/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium text-sm">
              <Package className="w-4 h-4" />
              Order History
            </Link>
            <Link href="/account/bespoke-orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium text-sm">
              <Gem className="w-4 h-4" />
              Bespoke Orders
            </Link>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium text-sm">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-border/60">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif text-foreground">Personal Information</h2>
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)} className="rounded-xl border-border text-primary hover:bg-muted hover:text-primary/90">
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl border-slate-200 text-slate-600">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-xl bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Save Changes
                  </Button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider uppercase text-slate-500">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-slate-50"
                  />
                ) : (
                  <p className="text-lg text-slate-800">{user.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider uppercase text-slate-500">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-slate-50"
                  />
                ) : (
                  <p className="text-lg text-slate-800">{user.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider uppercase text-slate-500">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-slate-50"
                  />
                ) : (
                  <p className="text-lg text-slate-800">{user.phone || '—'}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider uppercase text-slate-500">Member Since</label>
                <p className="text-lg text-slate-800">{new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Addresses section */}
            <div className="mt-12 pt-12 border-t border-slate-100 space-y-6">
              <h3 className="text-xl font-serif text-foreground">My Addresses</h3>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Permanent Address */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold tracking-wider uppercase text-slate-500">Billing Address</h4>
                  {isEditing ? (
                    <div className="space-y-3">
                      <select
                        value={country}
                        onChange={(e) => {
                          setCountry(e.target.value);
                          setState('');
                          setCity('');
                        }}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-primary text-sm"
                      >
                        <option value="" disabled>Country / Region *</option>
                        {Country.getAllCountries().map(c => (
                          <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                        ))}
                      </select>

                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={state}
                          onChange={(e) => {
                            setState(e.target.value);
                            setCity('');
                          }}
                          disabled={!country || billingStates.length === 0}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-primary text-sm disabled:opacity-50"
                        >
                          <option value="" disabled>State / Province *</option>
                          {billingStates.map(s => (
                            <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                          ))}
                        </select>
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          disabled={!state || billingCities.length === 0}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-primary text-sm disabled:opacity-50"
                        >
                          <option value="" disabled>Town / City *</option>
                          {billingCities.map(c => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House number and street name *"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-primary text-sm"
                      />
                      <input
                        type="text"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        placeholder="Apartment, suite, unit, etc. (optional)"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-primary text-sm"
                      />
                      <input
                        type="text"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        placeholder="Postcode / ZIP *"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-primary text-sm"
                      />
                    </div>
                  ) : (
                    <div className="text-base text-slate-700 whitespace-pre-line leading-relaxed min-h-[100px] bg-muted/50 p-4 rounded-xl border border-dashed border-border/40 space-y-1">
                      {address ? (
                        <>
                          <p>{address}</p>
                          {apartment && <p>{apartment}</p>}
                          <p>{city ? `${city}, ` : ''}{state} {zip}</p>
                          <p>{country ? Country.getCountryByCode(country)?.name || country : ''}</p>
                        </>
                      ) : (
                        <p>No billing address added yet.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Shipping Address */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold tracking-wider uppercase text-slate-500">Shipping Address</h4>
                    {isEditing && (
                      <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={sameAddress}
                          onChange={(e) => handleSameAddressChange(e.target.checked)}
                          className="rounded text-primary focus:ring-[var(--primary)]"
                        />
                        <span>Same as Billing</span>
                      </label>
                    )}
                  </div>

                  {isEditing ? (
                    <div className={`space-y-3 transition-all ${sameAddress ? 'opacity-60 pointer-events-none' : ''}`}>
                      <select
                        value={shippingCountry}
                        onChange={(e) => {
                          setShippingCountry(e.target.value);
                          setShippingState('');
                          setShippingCity('');
                        }}
                        disabled={sameAddress}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-primary text-sm"
                      >
                        <option value="" disabled>Country / Region *</option>
                        {Country.getAllCountries().map(c => (
                          <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                        ))}
                      </select>

                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={shippingState}
                          onChange={(e) => {
                            setShippingState(e.target.value);
                            setShippingCity('');
                          }}
                          disabled={sameAddress || !shippingCountry || shippingStates.length === 0}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-primary text-sm disabled:opacity-50"
                        >
                          <option value="" disabled>State / Province *</option>
                          {shippingStates.map(s => (
                            <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                          ))}
                        </select>
                        <select
                          value={shippingCity}
                          onChange={(e) => setShippingCity(e.target.value)}
                          disabled={sameAddress || !shippingState || shippingCities.length === 0}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-primary text-sm disabled:opacity-50"
                        >
                          <option value="" disabled>Town / City *</option>
                          {shippingCities.map(c => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <input
                        type="text"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        disabled={sameAddress}
                        placeholder="House number and street name *"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-primary text-sm"
                      />
                      <input
                        type="text"
                        value={shippingApartment}
                        onChange={(e) => setShippingApartment(e.target.value)}
                        disabled={sameAddress}
                        placeholder="Apartment, suite, unit, etc. (optional)"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-primary text-sm"
                      />
                      <input
                        type="text"
                        value={shippingZip}
                        onChange={(e) => setShippingZip(e.target.value)}
                        disabled={sameAddress}
                        placeholder="Postcode / ZIP *"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-primary text-sm"
                      />
                    </div>
                  ) : (
                    <div className="text-base text-slate-700 whitespace-pre-line leading-relaxed min-h-[100px] bg-muted/50 p-4 rounded-xl border border-dashed border-border/40 space-y-1">
                      {shippingAddress ? (
                        <>
                          <p>{shippingAddress}</p>
                          {shippingApartment && <p>{shippingApartment}</p>}
                          <p>{shippingCity ? `${shippingCity}, ` : ''}{shippingState} {shippingZip}</p>
                          <p>{shippingCountry ? Country.getCountryByCode(shippingCountry)?.name || shippingCountry : ''}</p>
                        </>
                      ) : (
                        <p>No shipping address added yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* <div className="mt-12 pt-12 border-t border-slate-100">
              <h3 className="text-xl font-serif text-foreground mb-6">Recent Activity</h3>
              <p className="text-slate-500 text-sm">You haven't made any recent changes to your account.</p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
