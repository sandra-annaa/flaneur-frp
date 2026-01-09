import { useState } from "react";

// PrimeReact imports
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';
import { Badge } from 'primereact/badge';
import { ProgressBar } from 'primereact/progressbar';
import type { TripData } from "./TripForm";

interface PackMyBagProps {
  tripData: TripData;
  tripId?: number;
  destination?: string;
  latitude?: number;
  longitude?: number;
}

interface PackingItem {
  id: string;
  label: string;
  category: string;
  icon: string;
}

export function PackMyBag({ tripData }: PackMyBagProps) {
  const generatePackingList = () => {
    const essentials = [
      { id: "passport", label: "Passport & ID", category: "Documents", icon: "pi-file" },
      { id: "tickets", label: "Tickets & Bookings", category: "Documents", icon: "pi-file" },
      { id: "insurance", label: "Travel Insurance", category: "Documents", icon: "pi-file" },
      { id: "money", label: "Cash & Credit Cards", category: "Documents", icon: "pi-file" },
    ];

    const clothing = [
      { id: "underwear", label: "Underwear (" + (tripData.duration * 2) + " pairs)", category: "Clothing", icon: "pi-t-shirt" },
      { id: "socks", label: "Socks (" + tripData.duration + " pairs)", category: "Clothing", icon: "pi-t-shirt" },
      { id: "tshirts", label: "T-shirts/Tops (" + tripData.duration + ")", category: "Clothing", icon: "pi-t-shirt" },
      { id: "pants", label: "Pants/Shorts (3-4)", category: "Clothing", icon: "pi-t-shirt" },
    ];

    // Activity-specific items
    if (tripData.activities === "adventure") {
      clothing.push(
        { id: "hiking-boots", label: "Hiking Boots", category: "Clothing", icon: "pi-t-shirt" },
        { id: "jacket", label: "Waterproof Jacket", category: "Clothing", icon: "pi-t-shirt" },
        { id: "backpack", label: "Daypack/Hiking Bag", category: "Gear", icon: "pi-shopping-bag" }
      );
    } else if (tripData.activities === "relaxation") {
      clothing.push(
        { id: "swimwear", label: "Swimwear (2-3)", category: "Clothing", icon: "pi-t-shirt" },
        { id: "sunhat", label: "Sun Hat", category: "Clothing", icon: "pi-t-shirt" },
        { id: "sandals", label: "Flip Flops/Sandals", category: "Clothing", icon: "pi-t-shirt" },
        { id: "sunglasses", label: "Sunglasses", category: "Accessories", icon: "pi-camera" }
      );
    } else if (tripData.activities === "sightseeing") {
      clothing.push(
        { id: "walking-shoes", label: "Comfortable Walking Shoes", category: "Clothing", icon: "pi-t-shirt" },
        { id: "light-jacket", label: "Light Jacket", category: "Clothing", icon: "pi-t-shirt" }
      );
    }

    const toiletries = [
      { id: "toothbrush", label: "Toothbrush & Toothpaste", category: "Toiletries", icon: "pi-plus-circle" },
      { id: "shampoo", label: "Shampoo & Soap", category: "Toiletries", icon: "pi-plus-circle" },
      { id: "sunscreen", label: "Sunscreen SPF 50+", category: "Toiletries", icon: "pi-plus-circle" },
      { id: "medications", label: "Personal Medications", category: "Toiletries", icon: "pi-plus-circle" },
      { id: "first-aid", label: "First Aid Kit", category: "Toiletries", icon: "pi-plus-circle" },
    ];

    const electronics = [
      { id: "phone-charger", label: "Phone & Charger", category: "Electronics", icon: "pi-bolt" },
      { id: "power-bank", label: "Power Bank", category: "Electronics", icon: "pi-bolt" },
      { id: "adapter", label: "Travel Adapter", category: "Electronics", icon: "pi-bolt" },
      { id: "camera", label: "Camera (Optional)", category: "Electronics", icon: "pi-camera" },
    ];

    // Budget-specific items
    const extras:PackingItem[] = [];
    if (tripData.budget === "luxury" || tripData.budget === "premium") {
      extras.push(
        { id: "formal-wear", label: "Formal Outfit", category: "Clothing", icon: "pi-t-shirt" },
        { id: "accessories", label: "Jewelry/Accessories", category: "Accessories", icon: "pi-camera" }
      );
    }

    return [...essentials, ...clothing, ...toiletries, ...electronics, ...extras];
  };

  const packingList = generatePackingList();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const categories = Array.from(new Set(packingList.map(item => item.category)));
  const progress = Math.round((checkedItems.size / packingList.length) * 100);

  const cardSubTitle = `Personalized packing checklist for your ${tripData.duration}-day ${tripData.activities} trip`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Card 
        title="PackMyBag"
        subTitle={cardSubTitle}
        style={{
          border: '1px solid var(--chocolate-200)',
          backgroundColor: 'var(--ivory-50)'
        }}
        footer={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--chocolate-700)' }}>Packing Progress</span>
            <Badge 
              value={`${checkedItems.size}/${packingList.length} Packed`}
              style={{
                backgroundColor: progress === 100 ? 'var(--chocolate-600)' : 'var(--chocolate-500)',
                color: 'var(--ivory-50)'
              }}
            />
          </div>
        }
      >
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--chocolate-700)' }}>{progress}% Complete</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--chocolate-900)' }}>
              {checkedItems.size}/{packingList.length}
            </span>
          </div>
          <ProgressBar 
            value={progress} 
            showValue={false}
            style={{ height: '8px', backgroundColor: 'var(--chocolate-100)' }}
          />
        </div>
      </Card>

      {categories.map(category => {
        const categoryItems = packingList.filter(item => item.category === category);
        const icon = categoryItems[0]?.icon || "pi-tag";
        const completedCount = categoryItems.filter(item => checkedItems.has(item.id)).length;
        
        return (
          <Card 
            key={category}
            style={{
              border: '1px solid var(--chocolate-200)',
              backgroundColor: 'var(--ivory-50)'
            }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className={icon} style={{ color: 'var(--chocolate-600)' }} />
                  <span style={{ color: 'var(--chocolate-900)', fontWeight: 500 }}>{category}</span>
                </div>
                <Badge 
                  value={`${completedCount}/${categoryItems.length}`}
                  style={{
                    backgroundColor: 'var(--chocolate-100)',
                    color: 'var(--chocolate-800)',
                    fontSize: '0.75rem'
                  }}
                />
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categoryItems.map(item => (
                <div 
                  key={item.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '8px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleItem(item.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--chocolate-50)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Checkbox 
                    inputId={item.id}
                    checked={checkedItems.has(item.id)}
                    onChange={() => toggleItem(item.id)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label
                    htmlFor={item.id}
                    style={{
                      flex: 1,
                      cursor: 'pointer',
                      color: checkedItems.has(item.id) ? 'var(--chocolate-400)' : 'var(--chocolate-800)',
                      textDecoration: checkedItems.has(item.id) ? 'line-through' : 'none'
                    }}
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}