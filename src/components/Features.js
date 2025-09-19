"use client";

import { useRouter } from "next/navigation";

const features = [
  {
    title: "AI Rideshare Chat",
    description: "Instantly optimize rideshare planning for riders, drivers, and companies.",
    image: "/videos/rideshare.mp4",
    link: "/chat",
  },
  {
    title: "Map View Hot Zones",
    description: "Visualize top pickup and drop-off areas.",
    image: "/images/map-preview.png",
    link: "/chat",
  },
];

export default function Features() {
  const router = useRouter();

  return (
    <section className="relative flex flex-col items-center py-12 bg-gradient-to-b from-gray-900 via-black to-gray-950 overflow-hidden">
      <h2 className="text-4xl text-center text-purple-400 font-extrabold mb-10 tracking-wide">
        Explore Features
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl w-full px-4">
        {features.map((feature, idx) => (
          <div
            key={idx}
            onClick={() => router.push(feature.link)}
            className="relative cursor-pointer flex flex-col items-center bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-[0_0_25px_rgba(128,0,255,0.7)] transition-shadow duration-300 border-2 border-purple-600 hover:border-pink-500 p-4"
          >
            <div className="w-full h-48 overflow-hidden rounded-lg mb-4">
              {feature.image.endsWith(".mp4") ? (
                <video
                  src={feature.image}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                />
              ) : (
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <h3 className="text-xl font-bold text-pink-400 mb-2 text-center">
              {feature.title}
            </h3>
            <p className="text-gray-300 text-center text-sm">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
