// PrimeReact imports
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Message } from 'primereact/message';
import type { TripData } from "./TripForm";

interface SafetyInfoProps {
  tripData: TripData;
}

export function SafetyInfo({ tripData }: SafetyInfoProps) {
  const emergencyContacts = [
    { service: "Emergency Services", number: "911", icon: "pi-exclamation-triangle" },
    { service: "Tourist Police", number: "+1-555-TOURIST", icon: "pi-shield" },
    { service: "Medical Emergency", number: "112", icon: "pi-heart" },
    { service: "Embassy/Consulate", number: "+1-555-EMBASSY", icon: "pi-phone" },
  ];

  const localGuides = [
    {
      name: "Adventure Tours Pro",
      specialty: "Trekking & Mountain Guides",
      rating: 4.9,
      contact: "+1-555-TREK-01",
      languages: ["English", "Spanish", "Local"],
      experience: "15+ years"
    },
    {
      name: "City Explorer Guides",
      specialty: "Cultural & Historical Tours",
      rating: 4.8,
      contact: "+1-555-CITY-02",
      languages: ["English", "French"],
      experience: "10+ years"
    },
    {
      name: "Coastal Adventures",
      specialty: "Water Sports & Beach Activities",
      rating: 4.7,
      contact: "+1-555-BEACH-03",
      languages: ["English", "Portuguese"],
      experience: "8+ years"
    }
  ];

  const safetyTips = [
    {
      title: "Document Safety",
      tips: [
        "Keep photocopies of your passport and ID",
        "Store digital copies in cloud storage",
        "Share itinerary with family/friends",
        "Register with your embassy"
      ]
    },
    {
      title: "Money & Valuables",
      tips: [
        "Use hotel safe for valuables",
        "Carry only necessary cash",
        "Inform bank of travel dates",
        "Keep emergency cash separate"
      ]
    },
    {
      title: "Health & Wellness",
      tips: [
        "Drink bottled water only",
        "Carry basic medications",
        "Know location of nearest hospital",
        "Get travel insurance with medical coverage"
      ]
    },
    {
      title: "Local Awareness",
      tips: [
        "Research local customs and laws",
        "Avoid isolated areas at night",
        "Use official taxis or ride-sharing apps",
        "Be aware of common tourist scams"
      ]
    }
  ];

  const weatherTips: Record<string, string> = {
    sightseeing: "Bring comfortable walking shoes and sun protection",
    adventure: "Pack layers, waterproof gear, and safety equipment",
    relaxation: "High SPF sunscreen, light clothing, and hydration essentials",
    foodie: "Light, breathable clothes for walking food tours",
    shopping: "Comfortable shoes and a secure bag/backpack",
    nature: "Insect repellent, sturdy shoes, and weather-appropriate clothing"
  };

  const contactsTitle = "Emergency Contacts";
  const contactsSubTitle = "Important numbers for " + tripData.destination;
  
  const guidesTitle = "Verified Local Guides";
  const guidesSubTitle = "Professional guides for " + tripData.activities + " activities";
  
  const weatherTitle = "Weather & Preparation";
  
  const safetyTitle = "Safety Guidelines";
  const safetySubTitle = "Essential safety tips for your trip";

  return (
    <div className="space-y-6">
      {/* Emergency Alert */}
      <Message 
        severity="warn" 
        text="Important Safety Information - Save these emergency contacts to your phone before your trip. Stay informed about local conditions and always prioritize your safety."
      />

      {/* Emergency Contacts */}
      <Card
        title={contactsTitle}
        subTitle={contactsSubTitle}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyContacts.map((contact, idx) => (
            <Card key={idx}>
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 rounded-full p-3">
                    <i className={contact.icon + " text-red-600"} style={{ fontSize: '1.25rem' }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-1 font-bold">{contact.service}</h4>
                    <p className="text-gray-600">{contact.number}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Local Guides */}
      {(tripData.activities === "adventure" || tripData.activities === "nature" || tripData.activities === "sightseeing") && (
        <Card
          title={guidesTitle}
          subTitle={guidesSubTitle}
        >
          <div className="space-y-4">
            {localGuides.map((guide, idx) => (
              <Card key={idx}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="mb-1 font-bold">{guide.name}</h4>
                      <p className="text-gray-600">{guide.specialty}</p>
                    </div>
                    <Badge value={"★ " + guide.rating} severity="info" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Contact:</span>
                      <p>{guide.contact}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Experience:</span>
                      <p>{guide.experience}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Languages:</span>
                      <p>{guide.languages.join(", ")}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Weather & Packing Tips */}
      <Card
        title={weatherTitle}
      >
        <Message 
          severity="info"
          text={weatherTips[tripData.activities] || weatherTips.sightseeing}
        />
      </Card>

      {/* Safety Tips */}
      <Card
        title={safetyTitle}
        subTitle={safetySubTitle}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {safetyTips.map((section, idx) => (
            <div key={idx}>
              <h4 className="mb-3 font-bold">{section.title}</h4>
              <ul className="space-y-2">
                {section.tips.map((tip, tipIdx) => (
                  <li key={tipIdx} className="flex items-start gap-2 text-gray-600">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* Travel Insurance Reminder */}
      <Message 
        severity="info"
        text="Make sure you have comprehensive travel insurance that covers medical emergencies, trip cancellations, and lost belongings. SmartTrip is not designed for collecting or storing sensitive personal or medical information."
      />
    </div>
  );
}