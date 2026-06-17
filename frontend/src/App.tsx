import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MatchVerifiedRoute } from "@/components/auth/MatchVerifiedRoute";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Chatbot } from "@/components/Chatbot";
import { CompareBar } from "@/components/CompareDrawer";
import { Home } from "@/pages/Home";
import { AccommodationList } from "@/pages/accommodation/List";
import { AccommodationDetail } from "@/pages/accommodation/Detail";
import { PostListing } from "@/pages/post/PostListing";
import { JobsList } from "@/pages/jobs/List";
import { JobDetail } from "@/pages/jobs/Detail";
import { ServicesList } from "@/pages/services/List";
import { ServiceDetail } from "@/pages/services/Detail";
import { Login } from "@/pages/auth/Login";
import { Register } from "@/pages/auth/Register";
import { Dashboard } from "@/pages/dashboard/Dashboard";
import { AdminPanel } from "@/pages/admin/AdminPanel";
import { MatchHome } from "@/pages/match/MatchHome";
import { MatchSeeker } from "@/pages/match/MatchSeeker";
import { MatchSearchCriteria } from "@/pages/match/MatchSearchCriteria";
import { ProfileBuilder } from "@/pages/match/ProfileBuilder";
import { MatchResults } from "@/pages/match/MatchResults";
import { MatchDetail } from "@/pages/match/MatchDetail";
import { AIChat } from "@/pages/match/AIChat";
import { MatchEmiratesIdVerification } from "@/pages/match/MatchEmiratesIdVerification";
import { MoveInCalculator } from "@/pages/Calculator";
import { Wishlist } from "@/pages/Wishlist";
import { SavedSearches } from "@/pages/SavedSearches";
import { Verification } from "@/pages/Verification";
import { Community } from "@/pages/Community";
import { AreaGuides } from "@/pages/community/AreaGuides";
import { AreaGuideDetail } from "@/pages/community/AreaGuideDetail";
import { Payments } from "@/pages/Payments";
import { Messages } from "@/pages/Messages";
import { PickupBook } from "@/pages/pickup/PickupBook";
import { PickupStatus } from "@/pages/pickup/PickupStatus";
import { ResumeList } from "@/pages/resume/ResumeList";
import { ResumeBuilderPage } from "@/pages/resume/ResumeBuilderPage";
import { ResumeTemplatePage } from "@/pages/resume/ResumeTemplatePage";
import { ResumeScreeningPage } from "@/pages/resume/ResumeScreeningPage";
import { ResumeShare } from "@/pages/resume/ResumeShare";
import { CopilotLayout } from "@/pages/jobs/copilot/CopilotLayout";
import {
  CopilotDashboardPage,
  CopilotLanding,
} from "@/pages/jobs/copilot/CopilotDashboard";
import { CopilotProfilePage } from "@/pages/jobs/copilot/CopilotProfile";
import { CopilotResumesPage } from "@/pages/jobs/copilot/CopilotResumes";
import { CopilotJobsPage } from "@/pages/jobs/copilot/CopilotJobs";
import { CopilotAdminPage } from "@/pages/jobs/copilot/CopilotAdmin";
import { CopilotAutomationSettingsPage } from "@/pages/jobs/copilot/CopilotAutomationSettings";
import { CopilotApplicationsPage } from "@/pages/jobs/copilot/CopilotApplications";
import { CopilotAiToolsPage } from "@/pages/jobs/copilot/CopilotAiTools";
import { CopilotBillingPage, CopilotBillingSuccessPage } from "@/pages/jobs/copilot/CopilotBilling";
import { CopilotPricingPage } from "@/pages/jobs/copilot/CopilotPricing";
import { NotFound } from "@/pages/NotFound";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/accommodation" element={<AccommodationList />} />
          <Route path="/accommodation/:id" element={<AccommodationDetail />} />

          <Route path="/jobs" element={<JobsList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          <Route path="/jobs/copilot">
            <Route index element={<CopilotLanding />} />
            <Route path="pricing" element={<CopilotPricingPage />} />
            <Route path="billing/success" element={<CopilotBillingSuccessPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <CopilotLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<CopilotDashboardPage />} />
              <Route path="jobs" element={<CopilotJobsPage />} />
              <Route path="applications" element={<CopilotApplicationsPage />} />
              <Route path="settings" element={<CopilotAutomationSettingsPage />} />
              <Route
                path="admin"
                element={
                  <ProtectedRoute adminOnly>
                    <CopilotAdminPage />
                  </ProtectedRoute>
                }
              />
              <Route path="ai" element={<CopilotAiToolsPage />} />
              <Route path="billing" element={<CopilotBillingPage />} />
              <Route path="profile" element={<CopilotProfilePage />} />
              <Route path="resumes" element={<CopilotResumesPage />} />
            </Route>
          </Route>

          <Route path="/resume" element={<ResumeList />} />
          <Route path="/resume/:id/screening" element={<ResumeScreeningPage />} />
          <Route path="/resume/:id/template" element={<ResumeTemplatePage />} />
          <Route path="/resume/:id/edit" element={<ResumeBuilderPage />} />
          <Route path="/resume/share/:token" element={<ResumeShare />} />

          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/services" element={<ServicesList />} />
          <Route path="/movers/:id" element={<ServiceDetail />} />
          <Route path="/movers" element={<ServicesList variant="movers" />} />
          <Route path="/tutoring/:id" element={<ServiceDetail />} />
          <Route path="/tutoring" element={<ServicesList variant="tutoring" />} />
          <Route path="/meals/:id" element={<ServiceDetail />} />
          <Route path="/meals" element={<ServicesList variant="meals" />} />

          {/* Pickup routes kept for later — toggle PICKUP_ENABLED in lib/pickup/flags.ts */}
          <Route path="/pickup" element={<PickupBook />} />
          <Route path="/pickup/:id" element={<PickupStatus />} />

          <Route path="/post" element={<PostListing />} />

          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          <Route path="/match" element={<MatchHome />} />
          <Route path="/match/seeker" element={<MatchSeeker />} />
          <Route
            path="/match/verify"
            element={
              <ProtectedRoute>
                <MatchEmiratesIdVerification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/match/profile"
            element={
              <ProtectedRoute>
                <ProfileBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/match/search"
            element={
              <MatchVerifiedRoute>
                <MatchSearchCriteria />
              </MatchVerifiedRoute>
            }
          />
          <Route
            path="/match/chat"
            element={
              <MatchVerifiedRoute>
                <AIChat />
              </MatchVerifiedRoute>
            }
          />
          <Route
            path="/match/results"
            element={
              <MatchVerifiedRoute>
                <MatchResults />
              </MatchVerifiedRoute>
            }
          />
          <Route
            path="/match/:id"
            element={
              <MatchVerifiedRoute>
                <MatchDetail />
              </MatchVerifiedRoute>
            }
          />

          <Route path="/calculator" element={<MoveInCalculator />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/saved-searches" element={<SavedSearches />} />
          <Route path="/verify" element={<Verification />} />
          <Route path="/verification" element={<Verification />} />

          <Route path="/community" element={<Community />} />
          <Route path="/community/areas" element={<AreaGuides />} />
          <Route path="/community/areas/:id" element={<AreaGuideDetail />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/messages" element={<Messages />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Chatbot />
      <CompareBar />
    </div>
  );
}
