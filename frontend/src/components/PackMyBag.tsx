import { useState } from "react";

// PrimeReact imports
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';
import { Badge } from 'primereact/badge';
import { ProgressBar } from 'primereact/progressbar';
import type { TripData } from "./TripForm";

interface PackMyBagProps {
  tripData: TripData;
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

  const cardSubTitle = "Personalized packing checklist for your " + tripData.duration + "-day " + tripData.activities + " trip";
  const badgeValue = checkedItems.size + "/" + packingList.length + " Packed";
  const badgeSeverity = progress === 100 ? "success" : "info";

  return (
    <div className="space-y-6">
      <Card 
        title="PackMyBag"
        subTitle={cardSubTitle}
        footer={
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Packing Progress</span>
            <Badge value={badgeValue} severity={badgeSeverity} />
          </div>
        }
      >
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">{progress}% Complete</span>
            <span className="text-sm font-semibold">{checkedItems.size}/{packingList.length}</span>
          </div>
          <ProgressBar value={progress} showValue={false} />
        </div>
      </Card>

      {categories.map(category => {
        const categoryItems = packingList.filter(item => item.category === category);
        const icon = categoryItems[0]?.icon || "pi-tag";
        const completedCount = categoryItems.filter(item => checkedItems.has(item.id)).length;
        const categoryBadgeValue = completedCount + "/" + categoryItems.length;
        
        return (
          <Card 
            key={category}
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className={icon + " text-gray-600"} />
                  <span>{category}</span>
                </div>
                <Badge value={categoryBadgeValue} severity="info" />
              </div>
            }
          >
            <div className="space-y-3">
              {categoryItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox 
                    inputId={item.id}
                    checked={checkedItems.has(item.id)}
                    onChange={() => toggleItem(item.id)}
                  />
                  <label
                    htmlFor={item.id}
                    className={`flex-1 cursor-pointer ${
                      checkedItems.has(item.id) ? 'line-through text-gray-400' : ''
                    }`}
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