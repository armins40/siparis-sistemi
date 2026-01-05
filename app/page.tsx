'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from './lib/auth'

type Language = 'tr' | 'en' | 'ar'

interface Translations {
  hero: {
    title: string
    subtitle: string
    description: string
  }
  pricing: {
    title: string
    plans: {
      freeTrial: {
        title: string
        description: string
        features: string[]
      }
      monthly: {
        title: string
        description: string
        features: string[]
      }
      sixMonths: {
        title: string
        description: string
        features: string[]
      }
      yearly: {
        title: string
        description: string
        features: string[]
      }
    }
    bestValue: string
    button: string
    duration: {
      days: string
    }
  }
}

const translations: Record<Language, Translations> = {
  tr: {
    hero: {
      title: 'Küçük Esnaf için Online Sipariş Sistemi',
      subtitle: 'Tekel, Manav, Bakkal ve küçük esnaf için modern çözüm',
      description: 'Online sipariş alma, QR menü, hızlı kurulum. Teknik bilgi gerektirmez. Müşterileriniz kolayca sipariş verebilir, siz de siparişlerinizi tek yerden yönetebilirsiniz.'
    },
    pricing: {
      title: 'Fiyatlandırma',
      plans: {
        freeTrial: {
          title: 'Ücretsiz Deneme',
          description: '7 gün boyunca tüm özellikleri ücretsiz deneyin',
          features: [
            'Tüm özelliklere tam erişim',
            'Online sipariş yönetimi',
            'Müşteri desteği',
            'Kredi kartı gerektirmez'
          ]
        },
        monthly: {
          title: 'Aylık',
          description: 'Küçük işletmeler için ideal',
          features: [
            'Tüm premium özellikler',
            'Sınırsız sipariş',
            'Öncelikli destek',
            'Aylık ödeme'
          ]
        },
        sixMonths: {
          title: '6 Aylık',
          description: '6 aylık taahhüt ile tasarruf edin',
          features: [
            'Tüm premium özellikler',
            'Sınırsız sipariş',
            'Öncelikli destek',
            'En iyi tasarruf'
          ]
        },
        yearly: {
          title: 'Yıllık',
          description: 'Büyüyen işletmeler için en iyi değer',
          features: [
            'Tüm premium özellikler',
            'Sınırsız sipariş',
            'Öncelikli destek',
            'Maksimum tasarruf',
            'Ücretsiz kurulum desteği'
          ]
        }
      },
      bestValue: 'En İyi Değer',
      button: 'Başla',
      duration: {
        days: 'gün'
      }
    }
  },
  en: {
    hero: {
      title: 'Online Ordering System for Local Stores',
      subtitle: 'Modern solution for small shops, grocery stores, and local merchants',
      description: 'Online ordering, QR menu, fast setup. No technical knowledge required. Your customers can easily place orders, and you can manage all orders from one place.'
    },
    pricing: {
      title: 'Pricing',
      plans: {
        freeTrial: {
          title: 'Free Trial',
          description: 'Try all features free for 7 days',
          features: [
            'Full access to all features',
            'Online order management',
            'Customer support',
            'No credit card required'
          ]
        },
        monthly: {
          title: 'Monthly',
          description: 'Perfect for small businesses',
          features: [
            'All premium features',
            'Unlimited orders',
            'Priority support',
            'Monthly billing'
          ]
        },
        sixMonths: {
          title: '6 Months',
          description: 'Save with 6-month commitment',
          features: [
            'All premium features',
            'Unlimited orders',
            'Priority support',
            'Best savings'
          ]
        },
        yearly: {
          title: 'Yearly',
          description: 'Best value for growing businesses',
          features: [
            'All premium features',
            'Unlimited orders',
            'Priority support',
            'Maximum savings',
            'Free setup assistance'
          ]
        }
      },
      bestValue: 'Best Value',
      button: 'Get Started',
      duration: {
        days: 'days'
      }
    }
  },
  ar: {
    hero: {
      title: 'نظام الطلبات الإلكترونية للمتاجر الصغيرة',
      subtitle: 'حل حديث للمتاجر الصغيرة والبقالات والتجار المحليين',
      description: 'استقبال الطلبات عبر الإنترنت، قائمة QR، إعداد سريع. لا يتطلب معرفة تقنية. يمكن لعملائك تقديم الطلبات بسهولة، ويمكنك إدارة جميع الطلبات من مكان واحد.'
    },
    pricing: {
      title: 'الأسعار',
      plans: {
        freeTrial: {
          title: 'تجربة مجانية',
          description: 'جرب جميع الميزات مجاناً لمدة 7 أيام',
          features: [
            'وصول كامل لجميع الميزات',
            'إدارة الطلبات عبر الإنترنت',
            'دعم العملاء',
            'لا يتطلب بطاقة ائتمان'
          ]
        },
        monthly: {
          title: 'شهري',
          description: 'مثالي للشركات الصغيرة',
          features: [
            'جميع الميزات المميزة',
            'طلبات غير محدودة',
            'دعم ذو أولوية',
            'الفوترة الشهرية'
          ]
        },
        sixMonths: {
          title: '6 أشهر',
          description: 'وفر مع الالتزام لمدة 6 أشهر',
          features: [
            'جميع الميزات المميزة',
            'طلبات غير محدودة',
            'دعم ذو أولوية',
            'أفضل المدخرات'
          ]
        },
        yearly: {
          title: 'سنوي',
          description: 'أفضل قيمة للشركات النامية',
          features: [
            'جميع الميزات المميزة',
            'طلبات غير محدودة',
            'دعم ذو أولوية',
            'أقصى مدخرات',
            'مساعدة إعداد مجانية'
          ]
        }
      },
      bestValue: 'أفضل قيمة',
      button: 'ابدأ',
      duration: {
        days: 'أيام'
      }
    }
  }
}

interface PricingPlan {
  id: 'free' | 'monthly' | 'six_months' | 'yearly'
  title: string
  price: number
  duration?: string
  description: string
  features: string[]
  isBestValue?: boolean
}

export default function HomePage() {
  const router = useRouter()
  const [language, setLanguage] = useState<Language>('tr')
  const t = translations[language]
  const isRTL = language === 'ar'

  const getPricingPlans = (): PricingPlan[] => [
    {
      id: 'free',
      title: t.pricing.plans.freeTrial.title,
      price: 0,
      duration: `7 ${t.pricing.duration.days}`,
      description: t.pricing.plans.freeTrial.description,
      features: t.pricing.plans.freeTrial.features
    },
    {
      id: 'monthly',
      title: t.pricing.plans.monthly.title,
      price: 299,
      description: t.pricing.plans.monthly.description,
      features: t.pricing.plans.monthly.features
    },
    {
      id: 'six_months',
      title: t.pricing.plans.sixMonths.title,
      price: 1499,
      description: t.pricing.plans.sixMonths.description,
      features: t.pricing.plans.sixMonths.features
    },
    {
      id: 'yearly',
      title: t.pricing.plans.yearly.title,
      price: 2799,
      description: t.pricing.plans.yearly.description,
      features: t.pricing.plans.yearly.features,
      isBestValue: true
    }
  ]

  const pricingPlans = getPricingPlans()

  const handlePlanClick = (planId: string) => {
    if (typeof window === 'undefined') return

    // Save selected plan to localStorage
    localStorage.setItem('selectedPlan', planId)

    // Check if user is logged in
    const isLoggedIn = auth.isAuthenticated()

    // Redirect based on auth status
    if (isLoggedIn) {
      router.push('/dashboard')
    } else {
      router.push('/register')
    }
  }

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    fontFamily: isRTL 
      ? '"Segoe UI", "Arabic UI Display", Arial, sans-serif'
      : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    boxSizing: 'border-box',
    direction: isRTL ? 'rtl' : 'ltr'
  }

  const languageSwitcherStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginBottom: '20px',
    paddingTop: '20px'
  }

  const langButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '400',
    color: isActive ? '#3b82f6' : '#666',
    backgroundColor: isActive ? '#e0e7ff' : '#ffffff',
    border: `1px solid ${isActive ? '#3b82f6' : '#e5e7eb'}`,
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  })

  const heroSectionStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '60px',
    paddingTop: '20px',
    maxWidth: '800px',
    marginLeft: 'auto',
    marginRight: 'auto'
  }

  const heroTitleStyle: React.CSSProperties = {
    fontSize: 'clamp(28px, 5vw, 42px)',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 16px 0',
    lineHeight: '1.2',
    letterSpacing: '-0.02em'
  }

  const heroSubtitleStyle: React.CSSProperties = {
    fontSize: 'clamp(16px, 3vw, 20px)',
    color: '#3b82f6',
    fontWeight: '600',
    margin: '0 0 20px 0',
    lineHeight: '1.4'
  }

  const heroDescriptionStyle: React.CSSProperties = {
    fontSize: 'clamp(15px, 2.5vw, 18px)',
    color: '#666',
    margin: '0',
    lineHeight: '1.7',
    maxWidth: '700px',
    marginLeft: 'auto',
    marginRight: 'auto'
  }

  const pricingTitleStyle: React.CSSProperties = {
    fontSize: 'clamp(24px, 4vw, 32px)',
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    margin: '0 0 40px 0'
  }

  const plansContainerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    paddingBottom: '60px',
    justifyContent: 'center'
  }

  const cardStyle = (isBestValue: boolean): React.CSSProperties => ({
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: isBestValue 
      ? '0 4px 20px rgba(59, 130, 246, 0.3)' 
      : '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: isBestValue ? '2px solid #3b82f6' : '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative' as const,
    width: '100%',
    maxWidth: '100%',
    flex: '1 1 250px'
  })

  const bestValueBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    [isRTL ? 'left' : 'right']: '24px',
    top: '-12px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase'
  }

  const cardTitleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: '0 0 8px 0'
  }

  const priceContainerStyle: React.CSSProperties = {
    marginBottom: '16px'
  }

  const priceStyle: React.CSSProperties = {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: '0',
    direction: 'ltr',
    textAlign: isRTL ? 'right' : 'left'
  }

  const currencyStyle: React.CSSProperties = {
    fontSize: '24px',
    verticalAlign: 'top'
  }

  const durationStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
    margin: '4px 0 0 0'
  }

  const descriptionStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 20px 0',
    lineHeight: '1.5'
  }

  const featuresListStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: '0',
    margin: '0 0 24px 0',
    flex: '1'
  }

  const featureItemStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#333',
    margin: '0 0 10px 0',
    paddingLeft: isRTL ? '0' : '24px',
    paddingRight: isRTL ? '24px' : '0',
    position: 'relative' as const
  }

  const featureCheckStyle: React.CSSProperties = {
    position: 'absolute',
    [isRTL ? 'right' : 'left']: '0',
    top: '2px',
    color: '#10b981',
    fontWeight: 'bold'
  }

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  }

  return (
    <div style={containerStyle}>
      <div style={languageSwitcherStyle}>
        <button
          onClick={() => setLanguage('tr')}
          style={langButtonStyle(language === 'tr')}
          aria-label="Türkçe"
        >
          TR
        </button>
        <button
          onClick={() => setLanguage('en')}
          style={langButtonStyle(language === 'en')}
          aria-label="English"
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('ar')}
          style={langButtonStyle(language === 'ar')}
          aria-label="العربية"
        >
          AR
        </button>
      </div>

      <section style={heroSectionStyle}>
        <h1 style={heroTitleStyle}>{t.hero.title}</h1>
        <p style={heroSubtitleStyle}>{t.hero.subtitle}</p>
        <p style={heroDescriptionStyle}>{t.hero.description}</p>
      </section>

      <section>
        <h2 style={pricingTitleStyle}>{t.pricing.title}</h2>
        <div style={plansContainerStyle}>
          {pricingPlans.map((plan) => (
            <div key={plan.title} style={cardStyle(plan.isBestValue || false)}>
              {plan.isBestValue && (
                <div style={bestValueBadgeStyle}>{t.pricing.bestValue}</div>
              )}
              
              <h3 style={cardTitleStyle}>{plan.title}</h3>
              
              <div style={priceContainerStyle}>
                <p style={priceStyle}>
                  {plan.price}
                  <span style={currencyStyle}> ₺</span>
                </p>
                {plan.duration && (
                  <p style={durationStyle}>{plan.duration}</p>
                )}
              </div>

              <p style={descriptionStyle}>{plan.description}</p>

              <ul style={featuresListStyle}>
                {plan.features.map((feature, index) => (
                  <li key={index} style={featureItemStyle}>
                    <span style={featureCheckStyle}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handlePlanClick(plan.id)}
                style={buttonStyle}
              >
                {t.pricing.button}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
