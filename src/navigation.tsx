import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./screens/Home";
import Depression from "./screens/Depression";
import Anxiety from "./screens/Anxiety";
import OCD from "./screens/OCD";
import Bipolar from "./screens/Bipolar";
import SocialPhobia from "./screens/SocialPhobia";
import Autism from "./screens/Autism";
import ADHD from "./screens/ADHD";
import Hyperactivity from "./screens/Hyperactivity";

import Stories from "./screens/Stories";
import Sleep from "./screens/Sleep";
import Profile from "./screens/Profile";
import Relationships from "./screens/Relationships";
import Chat from "./components/Chat";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Therapy Sections */}
        <Route path="/depression" element={<Depression />} />
        <Route path="/anxiety" element={<Anxiety />} />
        <Route path="/ocd" element={<OCD />} />
        <Route path="/bipolar" element={<Bipolar />} />
        <Route path="/social-phobia" element={<SocialPhobia />} />

        {/* Distinct Minds */}
        <Route path="/autism" element={<Autism />} />
        <Route path="/adhd" element={<ADHD />} />
        <Route path="/hyperactivity" element={<Hyperactivity />} />

        {/* Other Sections */}
        <Route path="/stories" element={<Stories />} />
        <Route path="/sleep" element={<Sleep />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/relationships" element={<Relationships />} />

        {/* Chat */}
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}
