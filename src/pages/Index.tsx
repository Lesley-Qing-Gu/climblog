import { useState } from "react";
import BottomNavigation from "@/components/BottomNavigation";
import HomePage from "@/components/HomePage";
import LogbookPage from "@/components/LogbookPage";
import ChallengesPage from "@/components/ChallengesPage";
import CameraPage from "@/components/CameraPage";
import ProfilePage from "@/components/ProfilePage";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("home");

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />;
      case "logbook":
        return <LogbookPage />;
      case "challenges":
        return <ChallengesPage />;
      case "camera":
        return <CameraPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="relative">
        {renderCurrentPage()}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
      />
    </div>
  );
};

export default Index;