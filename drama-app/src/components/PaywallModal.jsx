import React, { useState } from 'react';
import { X, Check, Crown, Star } from 'lucide-react';
import './PaywallModal.css';

const PaywallModal = ({ onClose, onSubscribe }) => {
  const [selectedPlan, setSelectedPlan] = useState('vip');

  const plans = [
    {
      id: 'vip',
      name: 'VIP 會員',
      price: 'NT$ 290',
      period: '每週',
      icon: Star,
      color: '#e74c3c',
      features: [
        '解鎖全部劇集',
        '高清畫質',
        '無廣告觀看',
        '7天內隨時取消',
        '多設備同步觀看'
      ]
    },
    {
      id: 'vvip',
      name: 'VVIP 會員',
      price: 'NT$ 6,990',
      period: '每年',
      icon: Crown,
      color: '#f39c12',
      features: [
        '✨ VIP 全部權益',
        '🎁 獨家會員專區',
        '🚀 優先觀看新劇',
        '💎 專屬客服支持',
        '🎬 離線下載功能',
        '💰 省下 8,090 元'
      ],
      badge: '最划算',
      savings: '相當於每週 NT$ 134'
    }
  ];

  const handleSubscribe = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    onSubscribe(plan);
  };

  return (
    <div className="paywall-modal-overlay">
      <div className="paywall-modal">
        <button className="paywall-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="paywall-header">
          <div className="paywall-lock-icon">🔒</div>
          <h2>升級會員 繼續觀看</h2>
          <p>第 8 集後需要成為會員才能繼續觀看精彩內容</p>
        </div>

        <div className="paywall-plans">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`paywall-plan ${selectedPlan === plan.id ? 'selected' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.badge && (
                  <div className="plan-badge">{plan.badge}</div>
                )}
                
                <div className="plan-icon" style={{ background: plan.color }}>
                  <Icon size={32} color="white" />
                </div>

                <h3>{plan.name}</h3>
                
                <div className="plan-price">
                  <span className="price">{plan.price}</span>
                  <span className="period">{plan.period}</span>
                </div>

                {plan.savings && (
                  <div className="plan-savings">{plan.savings}</div>
                )}

                <ul className="plan-features">
                  {plan.features.map((feature, index) => (
                    <li key={index}>
                      <Check size={16} className="check-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="plan-radio">
                  <div className={`radio ${selectedPlan === plan.id ? 'checked' : ''}`}>
                    {selectedPlan === plan.id && <div className="radio-dot" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button className="paywall-subscribe-btn" onClick={handleSubscribe}>
          立即訂閱 {plans.find(p => p.id === selectedPlan)?.name}
        </button>

        <p className="paywall-footer">
          安全支付 • 隨時取消 • 自動續訂
        </p>
      </div>
    </div>
  );
};

export default PaywallModal;
