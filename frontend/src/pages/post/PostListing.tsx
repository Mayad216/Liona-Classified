import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Briefcase,
  Wrench,
  CheckCircle2,
  Upload,
  Sparkles,
  ShieldCheck,
  Loader2,
  Truck,
  BookOpen,
  ChefHat,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { BusinessProfileSetupForm } from "@/components/business/BusinessProfileSetupForm";
import { useAuth } from "@/lib/auth";
import { useBusinessProfile } from "@/lib/businessProfile/useBusinessProfile";
import { HOME_SERVICE_CATEGORIES, ALL_SERVICE_CATEGORIES, isStandaloneServiceCategory, TUTORING_LANGUAGES, TUTORING_LEVELS, MEAL_CUISINES, MEAL_DIETARY_TAGS, MEAL_FULFILLMENT_OPTIONS, MEAL_OFFERING_TYPES, PEST_TYPES } from "@/lib/services/catalog";
import {
  getBasicsCopy,
  getPhotosCopy,
  getPostSteps,
  getServicePostCopy,
  JOB_DETAILS_COPY,
  postStepLabel,
  type AccommodationListingIntent,
  type PostMode,
  type PostStepKey,
} from "@/lib/post/postListingCopy";
import { JobListingOptionField } from "@/components/post/JobListingOptionField";
import { JobApplicationSetupSection } from "@/components/jobs/JobApplicationSetupSection";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { useJobListingOptions } from "@/lib/post/useJobListingOptions";
import {
  canGenerateServiceDescription,
  fetchServiceListingDescription,
} from "@/lib/post/serviceListingAi";
import {
  SERVICE_COVERAGE_OPTIONS,
  SERVICE_PROVIDER_NAME_MODES,
  SERVICE_RESPONSE_TIMES,
  SERVICE_SAME_DAY_OPTIONS,
  SERVICE_TRADE_LICENCE_OPTIONS,
  SERVICE_YEARS_EXPERIENCE,
  serviceAreaOptions,
  serviceEmirateOptions,
  servicePriceOptions,
  serviceTitleOptions,
  serviceUnitOptions,
  type ServiceListingFormContext,
} from "@/lib/post/serviceListingCatalog";
import { areasForEmirate } from "@/lib/matchmaking/uaeLocations";
import {
  fetchJobListingSuggestions,
  linesToText,
  type JobListingSuggestions,
} from "@/lib/post/jobListingAi";
import type { JobApplicationMethod, JobApplicationQuestion } from "@/types/jobApplication";
import type {
  Emirate,
  MealFulfillment,
  MealOfferingType,
  ServiceCategory,
  ServiceProviderAccountType,
  TutoringSessionFormat,
} from "@/types";
import { cn, formatPrice } from "@/lib/utils";

type Mode = PostMode;

type PostChooseOption = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub: string;
  gradient: string;
  mode?: Mode;
  serviceCategory?: ServiceCategory;
  navigateTo?: string;
  requiresAuth?: boolean;
  listingIntent?: AccommodationListingIntent;
};

function renderStepContent(
  stepKey: PostStepKey,
  props: {
    mode: Mode;
    activeServiceCategory: ServiceCategory | null;
    serviceCategory: ServiceCategory;
    onServiceCategoryChange: (category: ServiceCategory) => void;
    jobRole: string;
    jobIndustry: string;
    onJobRoleChange: (role: string) => void;
    onJobIndustryChange: (industry: string) => void;
    roleSelectOptions: { value: string; label: string }[];
    industrySelectOptions: { value: string; label: string }[];
    saveCustomJobOption: (kind: "role" | "industry", name: string) => Promise<string>;
    serviceTitle: string;
    onServiceTitleChange: (value: string) => void;
    serviceEmirate: Emirate;
    onServiceEmirateChange: (value: Emirate) => void;
    serviceArea: string;
    onServiceAreaChange: (value: string) => void;
    serviceCategoryForBasics: ServiceCategory | null;
    businessCompanyName?: string;
    businessIndustry?: string;
    accommodationIntent: AccommodationListingIntent;
  }
) {
  switch (stepKey) {
    case "basics":
      return (
        <BasicsStep
          mode={props.mode}
          serviceCategory={props.activeServiceCategory}
          jobRole={props.jobRole}
          onJobRoleChange={props.onJobRoleChange}
          roleSelectOptions={props.roleSelectOptions}
          saveCustomJobOption={props.saveCustomJobOption}
          serviceTitle={props.serviceTitle}
          onServiceTitleChange={props.onServiceTitleChange}
          serviceEmirate={props.serviceEmirate}
          onServiceEmirateChange={props.onServiceEmirateChange}
          serviceArea={props.serviceArea}
          onServiceAreaChange={props.onServiceAreaChange}
          serviceCategoryForBasics={
            props.mode === "service" ? props.serviceCategory : props.activeServiceCategory
          }
          accommodationIntent={props.accommodationIntent}
        />
      );
    case "details":
      return (
        <DetailsStep
          mode={props.mode}
          accommodationIntent={props.accommodationIntent}
          serviceCategory={props.serviceCategory}
          onServiceCategoryChange={props.onServiceCategoryChange}
          jobRole={props.jobRole}
          jobIndustry={props.jobIndustry}
          onJobRoleChange={props.onJobRoleChange}
          onJobIndustryChange={props.onJobIndustryChange}
          roleSelectOptions={props.roleSelectOptions}
          industrySelectOptions={props.industrySelectOptions}
          saveCustomJobOption={props.saveCustomJobOption}
          serviceTitle={props.serviceTitle}
          serviceEmirate={props.serviceEmirate}
          serviceArea={props.serviceArea}
          businessCompanyName={props.businessCompanyName}
        />
      );
    case "photos":
      return (
        <PhotosStep
          mode={props.mode}
          serviceCategory={props.activeServiceCategory}
          accommodationIntent={props.accommodationIntent}
        />
      );
    case "pricing":
      return <PricingStep mode={props.mode} />;
    case "review":
      return (
        <ReviewStep
          mode={props.mode}
          businessCompanyName={props.businessCompanyName}
        />
      );
    default:
      return null;
  }
}

export function PostListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode");
  const presetMode: Mode | null =
    initialMode === "accommodation" ||
    initialMode === "job" ||
    initialMode === "service"
      ? initialMode
      : null;

  const presetServiceCategory = ALL_SERVICE_CATEGORIES.find(
    (c) => c.key === searchParams.get("category")
  )?.key;
  const [listingIntent, setListingIntent] = useState<AccommodationListingIntent>(
    searchParams.get("intent") === "roommate" ? "roommate" : "rental"
  );
  const [mode, setMode] = useState<Mode | null>(presetMode);
  const [step, setStep] = useState(presetMode ? 1 : 0);
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>(
    presetServiceCategory ?? HOME_SERVICE_CATEGORIES[0].key
  );
  const [serviceCategoryChosen, setServiceCategoryChosen] = useState(Boolean(presetServiceCategory));
  const [jobRole, setJobRole] = useState("");
  const [jobIndustry, setJobIndustry] = useState("");
  const [serviceTitle, setServiceTitle] = useState("");
  const [serviceEmirate, setServiceEmirate] = useState<Emirate>("Dubai");
  const [serviceArea, setServiceArea] = useState("");
  const {
    roleSelectOptions,
    industrySelectOptions,
    saveCustomOption: saveCustomJobOption,
  } = useJobListingOptions();
  const {
    profile: businessProfile,
    loading: businessProfileLoading,
    saving: businessProfileSaving,
    error: businessProfileError,
    isComplete: hasBusinessProfile,
    save: saveBusinessProfile,
  } = useBusinessProfile(user?.id);
  const fromMatchRoom = mode === "accommodation" && listingIntent === "roommate";

  useEffect(() => {
    if (mode !== "job" || !businessProfile || jobIndustry) return;
    if (businessProfile.industry) {
      setJobIndustry(businessProfile.industry);
    }
  }, [mode, businessProfile, jobIndustry]);

  const activeServiceCategory =
    mode === "service" && serviceCategoryChosen ? serviceCategory : null;

  const handlePickOption = (option: PostChooseOption) => {
    if (option.requiresAuth && !user) {
      const redirect =
        option.navigateTo ??
        (option.mode === "job"
          ? "/post?mode=job"
          : option.mode === "accommodation" && option.listingIntent === "roommate"
            ? "/post?mode=accommodation&intent=roommate"
          : option.mode === "service" && option.serviceCategory
            ? `/post?mode=service&category=${encodeURIComponent(option.serviceCategory)}`
            : option.mode
              ? `/post?mode=${option.mode}`
              : "/post");
      navigate(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    if (option.navigateTo) {
      navigate(option.navigateTo);
      return;
    }

    if (option.mode === "job" && !user) {
      navigate("/auth/login?redirect=/post?mode=job");
      return;
    }

    if (option.serviceCategory) {
      setServiceCategory(option.serviceCategory);
      setServiceCategoryChosen(true);
    } else if (option.mode === "service") {
      setServiceCategory(HOME_SERVICE_CATEGORIES[0].key);
      setServiceCategoryChosen(true);
    }

    if (option.listingIntent) {
      setListingIntent(option.listingIntent);
    } else if (option.mode === "accommodation") {
      setListingIntent("rental");
    }

    if (option.mode) {
      setMode(option.mode);
      setStep(1);
    }
  };

  if (!mode) return <ChooseMode onPick={handlePickOption} />;

  if (mode === "job") {
    if (!user) {
      return (
        <div className="container max-w-lg py-20 text-center">
          <h1 className="text-2xl font-bold">Sign in to post a job</h1>
          <p className="mt-2 text-slate-600">
            Job listings can only be published from a Business Profile.
          </p>
          <Link to="/auth/login?redirect=/post?mode=job" className="mt-6 inline-block">
            <Button>Sign in</Button>
          </Link>
        </div>
      );
    }

    if (businessProfileLoading) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      );
    }

    if (!hasBusinessProfile) {
      return (
        <div className="bg-slate-50/60 pb-20 pt-8">
          <div className="container max-w-3xl">
            <button
              type="button"
              onClick={() => setMode(null)}
              className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <BusinessProfileSetupForm
                initial={businessProfile}
                saving={businessProfileSaving}
                error={businessProfileError}
                onSubmit={async (input) => {
                  await saveBusinessProfile(input);
                }}
              />
            </div>
          </div>
        </div>
      );
    }
  }

  const postSteps = getPostSteps(mode);
  const currentStepKey = postSteps[step] ?? "basics";
  const lastStepIndex = postSteps.length - 1;

  const next = () => {
    setStep((s) => {
      const nextStep = Math.min(s + 1, lastStepIndex);
      if (mode === "service" && postSteps[nextStep] === "details") {
        setServiceCategoryChosen(true);
      }
      return nextStep;
    });
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleBack = () => {
    if (step === 1) {
      if (fromMatchRoom) {
        navigate("/match");
        return;
      }
      setMode(null);
      return;
    }
    back();
  };

  return (
    <div className="bg-slate-50/60 pb-20 pt-8">
      <div className="container max-w-3xl">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {mode === "job" && businessProfile && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Building2 className="h-3.5 w-3.5" />
            Posting as {businessProfile.company_name}
          </p>
        )}

        {fromMatchRoom && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800">
            <Sparkles className="h-3.5 w-3.5" />
            Match Me — listing for a roommate or flatmate
          </p>
        )}

        <Stepper step={step} steps={postSteps} />

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          {currentStepKey !== "category" &&
            renderStepContent(currentStepKey, {
              mode,
              activeServiceCategory,
              serviceCategory,
              onServiceCategoryChange: (category) => {
                setServiceCategory(category);
                setServiceCategoryChosen(true);
              },
              jobRole,
              jobIndustry,
              onJobRoleChange: setJobRole,
              onJobIndustryChange: setJobIndustry,
              roleSelectOptions,
              industrySelectOptions,
              saveCustomJobOption,
              serviceTitle,
              onServiceTitleChange: setServiceTitle,
              serviceEmirate,
              onServiceEmirateChange: (emirate) => {
                setServiceEmirate(emirate);
                setServiceArea("");
              },
              serviceArea,
              onServiceAreaChange: setServiceArea,
              serviceCategoryForBasics:
                mode === "service" ? serviceCategory : activeServiceCategory,
              businessCompanyName: businessProfile?.company_name,
              businessIndustry: businessProfile?.industry,
              accommodationIntent: listingIntent,
            })}

          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
            <Button variant="ghost" onClick={back} disabled={step === 1}>
              Previous
            </Button>
            {step < lastStepIndex ? (
              <Button onClick={next}>
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Link to="/dashboard">
                <Button>
                  <CheckCircle2 className="h-4 w-4" /> Publish listing
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stepper({ step, steps }: { step: number; steps: PostStepKey[] }) {
  return (
    <ol className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {steps.map((stepKey, i) => (
        <li key={stepKey} className="flex flex-shrink-0 items-center gap-2">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
              i < step && "bg-emerald-500 text-white",
              i === step && "bg-brand-600 text-white",
              i > step && "bg-slate-200 text-slate-500"
            )}
          >
            {i < step ? <CheckCircle2 className="h-4 w-4" /> : i}
          </div>
          <span
            className={cn(
              "text-xs font-medium",
              i === step ? "text-slate-900" : "text-slate-500"
            )}
          >
            {postStepLabel(stepKey)}
          </span>
          {i < steps.length - 1 && <span className="text-slate-300">·</span>}
        </li>
      ))}
    </ol>
  );
}

function ChooseMode({ onPick }: { onPick: (option: PostChooseOption) => void }) {
  const options: PostChooseOption[] = [
    {
      id: "accommodation",
      mode: "accommodation",
      listingIntent: "rental",
      icon: Building2,
      title: "Accommodation",
      sub: "Rent out a room, partition, studio, or full apartment.",
      gradient: "from-brand-500 to-brand-700",
    },
    {
      id: "match-room",
      mode: "accommodation",
      listingIntent: "roommate",
      icon: Sparkles,
      title: "List your room",
      sub: "Already have a room or apartment? List it to find a compatible roommate or flatmate to share with — not for renting a whole place to a solo tenant.",
      gradient: "from-violet-500 to-brand-700",
    },
    {
      id: "job",
      mode: "job",
      icon: Briefcase,
      title: "Post a Job",
      sub: "Business Profiles only — hire on behalf of your registered company.",
      gradient: "from-emerald-500 to-emerald-700",
      requiresAuth: true,
    },
    {
      id: "movers",
      mode: "service",
      serviceCategory: "Movers",
      icon: Truck,
      title: "Movers",
      sub: "List moving, packing, and delivery services across the UAE.",
      gradient: "from-sky-500 to-sky-700",
    },
    {
      id: "tutor",
      mode: "service",
      serviceCategory: "Language Tutoring",
      icon: BookOpen,
      title: "Tutor",
      sub: "Offer private language lessons — online, in-person, or both.",
      gradient: "from-indigo-500 to-indigo-700",
    },
    {
      id: "meals",
      mode: "service",
      serviceCategory: "Homemade Meals",
      icon: ChefHat,
      title: "Homemade meals",
      sub: "Sell daily meals, tiffin boxes, or weekly meal plans from your kitchen.",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      id: "home-service",
      mode: "service",
      icon: Wrench,
      title: "Offer a Service",
      sub: "Cleaning, AC, plumbing, pest control, handyman & other home services.",
      gradient: "from-accent-500 to-accent-700",
    },
  ];

  return (
    <div className="container max-w-6xl pt-12 pb-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">What are you posting?</h1>
        <p className="mt-2 text-slate-600">Pick a category to get started — takes 30 seconds.</p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {options.map((option) => {
          const Icon = option.icon;
          return (
          <button
            key={option.id}
            type="button"
            onClick={() => onPick(option)}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
          >
            <div
              className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${option.gradient} text-white shadow-md`}
            >
              <Icon className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-lg font-bold">{option.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{option.sub}</p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
              Start posting
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
          );
        })}
      </div>
    </div>
  );
}

function BasicsStep({
  mode,
  serviceCategory,
  jobRole,
  onJobRoleChange,
  roleSelectOptions,
  saveCustomJobOption,
  serviceTitle,
  onServiceTitleChange,
  serviceEmirate,
  onServiceEmirateChange,
  serviceArea,
  onServiceAreaChange,
  serviceCategoryForBasics,
  accommodationIntent = "rental",
}: {
  mode: Mode;
  serviceCategory: ServiceCategory | null;
  jobRole: string;
  onJobRoleChange: (role: string) => void;
  roleSelectOptions: { value: string; label: string }[];
  saveCustomJobOption: (kind: "role" | "industry", name: string) => Promise<string>;
  serviceTitle: string;
  onServiceTitleChange: (value: string) => void;
  serviceEmirate: Emirate;
  onServiceEmirateChange: (value: Emirate) => void;
  serviceArea: string;
  onServiceAreaChange: (value: string) => void;
  serviceCategoryForBasics: ServiceCategory | null;
  accommodationIntent?: AccommodationListingIntent;
}) {
  const copy = getBasicsCopy(mode, serviceCategoryForBasics, accommodationIntent);
  const areaOptions =
    mode === "service" && serviceCategoryForBasics
      ? serviceAreaOptions(serviceEmirate, areasForEmirate(serviceEmirate))
      : [];

  return (
    <div className="space-y-5">
      <Heading title={copy.headingTitle} sub={copy.headingSub} />
      {mode === "job" ? (
        <JobListingOptionField
          label={copy.titleLabel}
          kind="role"
          value={jobRole}
          onChange={onJobRoleChange}
          options={roleSelectOptions}
          onSaveCustom={saveCustomJobOption}
        />
      ) : mode === "service" && serviceCategoryForBasics ? (
        <Select
          label={copy.titleLabel}
          value={serviceTitle}
          onChange={(e) => onServiceTitleChange(e.target.value)}
          options={[
            { value: "", label: "Select a listing title…" },
            ...serviceTitleOptions(serviceCategoryForBasics),
          ]}
        />
      ) : (
        <Input label={copy.titleLabel} placeholder={copy.titlePlaceholder} />
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {mode === "service" ? (
          <Select
            label="Emirate"
            value={serviceEmirate}
            onChange={(e) => onServiceEmirateChange(e.target.value as Emirate)}
            options={serviceEmirateOptions()}
          />
        ) : (
          <Select
            label="Emirate"
            options={[
              { value: "Dubai", label: "Dubai" },
              { value: "Abu Dhabi", label: "Abu Dhabi" },
              { value: "Sharjah", label: "Sharjah" },
              { value: "Ajman", label: "Ajman" },
            ]}
          />
        )}
        {mode === "service" && serviceCategoryForBasics ? (
          <Select
            label={copy.areaLabel}
            value={serviceArea}
            onChange={(e) => onServiceAreaChange(e.target.value)}
            options={[
              { value: "", label: "Select primary area…" },
              ...areaOptions,
            ]}
          />
        ) : (
          <Input label={copy.areaLabel} placeholder={copy.areaPlaceholder} />
        )}
      </div>
      {mode === "service" ? (
        <p className="text-xs text-slate-500">
          You'll add pricing, coverage, and an AI-generated description on the next step.
        </p>
      ) : mode !== "job" ? (
        <textarea
          rows={6}
          placeholder={copy.descriptionPlaceholder}
          className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
        />
      ) : null}
    </div>
  );
}

function PostTextArea({
  label,
  placeholder,
  rows = 5,
  hint,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  rows?: number;
  hint?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {hint ? <p className="mb-2 text-xs text-slate-500">{hint}</p> : null}
      <textarea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
      />
    </div>
  );
}

function RentalListingDetailsStep() {
  return (
    <div className="space-y-5">
      <Heading title="Property details" sub="Tenants love specifics — fill in as much as you can." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Room type"
          options={[
            { value: "Bedspace", label: "Bedspace" },
            { value: "Partition", label: "Partition" },
            { value: "Private Room", label: "Private Room" },
            { value: "Studio", label: "Studio" },
            { value: "Full Apartment", label: "Full Apartment" },
          ]}
        />
        <Input type="number" label="Size (sqft)" placeholder="e.g. 1100" />
        <Input type="number" label="Number of tenants" placeholder="2" />
        <Input type="number" label="Deposit (AED)" placeholder="2500" />
        <Select
          label="Gender preference"
          options={[
            { value: "Any", label: "Any" },
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
            { value: "Family", label: "Family" },
          ]}
        />
        <Input label="Nationality preference" placeholder="Any" />
      </div>
      <ListingAmenitiesField />
    </div>
  );
}

function RoommateListingDetailsStep() {
  return (
    <div className="space-y-5">
      <Heading
        title="Flatmate listing details"
        sub="For finding a roommate or flatmate to share your home — not for renting a whole unit to one tenant."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Room on offer"
          options={[
            { value: "Bedspace", label: "Bedspace" },
            { value: "Partition", label: "Partition" },
            { value: "Private Room", label: "Private Room in shared flat" },
          ]}
        />
        <Input type="number" label="Monthly rent — your share (AED)" placeholder="e.g. 2500" />
        <Input type="number" label="Deposit (AED)" placeholder="e.g. 1000" />
        <Input type="date" label="Available from" />
        <Select
          label="Preferred roommate gender"
          options={[
            { value: "Any", label: "Any" },
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
            { value: "Family", label: "Family" },
          ]}
        />
        <Input type="number" label="People already living here" placeholder="e.g. 2" />
        <Select
          label="Minimum stay"
          options={[
            { value: "1 month", label: "1 month" },
            { value: "3 months", label: "3 months" },
            { value: "6 months", label: "6 months" },
            { value: "1 year", label: "1 year" },
            { value: "Flexible", label: "Flexible" },
          ]}
        />
        <Select
          label="Bills"
          options={[
            { value: "Included", label: "Included in rent" },
            { value: "Shared", label: "Split equally" },
            { value: "Separate", label: "Paid separately" },
          ]}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600" />
          Attached bathroom
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600" />
          Balcony access
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600" />
          Furnished room
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600" />
          Show in Match Me search
        </label>
      </div>
      <Input
        label="Who lives here now?"
        placeholder="e.g. Two working professionals, quiet weekdays, social on weekends"
      />
      <ListingAmenitiesField />
    </div>
  );
}

function ListingAmenitiesField() {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">Amenities</label>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {["WiFi", "AC", "Parking", "Gym", "Pool", "Furnished", "Bills Included", "Balcony"].map(
          (a) => (
            <label key={a} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              {a}
            </label>
          )
        )}
      </div>
    </div>
  );
}

function DetailsStep({
  mode,
  accommodationIntent = "rental",
  serviceCategory,
  onServiceCategoryChange,
  jobRole,
  jobIndustry,
  onJobRoleChange,
  onJobIndustryChange,
  roleSelectOptions,
  industrySelectOptions,
  saveCustomJobOption,
  serviceTitle,
  serviceEmirate,
  serviceArea,
  businessCompanyName,
}: {
  mode: Mode;
  accommodationIntent?: AccommodationListingIntent;
  serviceCategory: ServiceCategory;
  onServiceCategoryChange: (category: ServiceCategory) => void;
  jobRole: string;
  jobIndustry: string;
  onJobRoleChange: (role: string) => void;
  onJobIndustryChange: (industry: string) => void;
  roleSelectOptions: { value: string; label: string }[];
  industrySelectOptions: { value: string; label: string }[];
  saveCustomJobOption: (kind: "role" | "industry", name: string) => Promise<string>;
  serviceTitle: string;
  serviceEmirate: Emirate;
  serviceArea: string;
  businessCompanyName?: string;
}) {
  if (mode === "accommodation" && accommodationIntent === "roommate") {
    return <RoommateListingDetailsStep />;
  }

  if (mode === "accommodation") {
    return <RentalListingDetailsStep />;
  }
  if (mode === "job") {
    return (
      <JobDetailsStep
        jobRole={jobRole}
        jobIndustry={jobIndustry}
        onJobRoleChange={onJobRoleChange}
        onJobIndustryChange={onJobIndustryChange}
        roleSelectOptions={roleSelectOptions}
        industrySelectOptions={industrySelectOptions}
        saveCustomJobOption={saveCustomJobOption}
        businessCompanyName={businessCompanyName}
      />
    );
  }
  return (
    <ServiceDetailsForm
      serviceCategory={serviceCategory}
      onServiceCategoryChange={onServiceCategoryChange}
      serviceTitle={serviceTitle}
      serviceEmirate={serviceEmirate}
      serviceArea={serviceArea}
    />
  );
}

function JobDetailsStep({
  jobRole,
  jobIndustry,
  onJobRoleChange,
  onJobIndustryChange,
  roleSelectOptions,
  industrySelectOptions,
  saveCustomJobOption,
  businessCompanyName,
}: {
  jobRole: string;
  jobIndustry: string;
  onJobRoleChange: (role: string) => void;
  onJobIndustryChange: (industry: string) => void;
  roleSelectOptions: { value: string; label: string }[];
  industrySelectOptions: { value: string; label: string }[];
  saveCustomJobOption: (kind: "role" | "industry", name: string) => Promise<string>;
  businessCompanyName?: string;
}) {
  const copy = JOB_DETAILS_COPY;
  const [company, setCompany] = useState(businessCompanyName ?? "");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [experienceLevel, setExperienceLevel] = useState("Mid");
  const [workArrangement, setWorkArrangement] = useState("Hybrid");
  const [applicationMethod, setApplicationMethod] = useState<JobApplicationMethod>("platform");
  const [applicationContact, setApplicationContact] = useState("");
  const [startDate, setStartDate] = useState("");
  const [applicationQuestions, setApplicationQuestions] = useState<JobApplicationQuestion[]>([]);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [benefits, setBenefits] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiApplied, setAiApplied] = useState<JobListingSuggestions | null>(null);

  useEffect(() => {
    if (businessCompanyName) setCompany(businessCompanyName);
  }, [businessCompanyName]);

  const canGenerate = Boolean(jobRole && jobIndustry);

  async function handleGenerateSuggestions() {
    if (!canGenerate) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const suggestions = await fetchJobListingSuggestions({
        role: jobRole,
        industry: jobIndustry,
        employmentType,
        experienceLevel,
        workArrangement,
        company: company || undefined,
      });
      applySuggestions(suggestions);
      setAiApplied(suggestions);
    } catch {
      setAiError("Could not generate suggestions right now. Try again in a moment.");
    } finally {
      setAiLoading(false);
    }
  }

  function applySuggestions(suggestions: JobListingSuggestions) {
    setDescription(suggestions.description);
    setResponsibilities(linesToText(suggestions.responsibilities));
    setQualifications(linesToText(suggestions.qualifications));
    setBenefits(linesToText(suggestions.benefits));
    if (suggestions.salaryMin != null) setSalaryMin(String(suggestions.salaryMin));
    if (suggestions.salaryMax != null) setSalaryMax(String(suggestions.salaryMax));
  }

  return (
    <div className="space-y-6">
      <Heading title={copy.headingTitle} sub={copy.headingSub} />

      <div className="rounded-2xl border border-brand-200/80 bg-gradient-to-br from-brand-50/70 to-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">AI draft assistant</p>
              <p className="mt-1 text-xs text-slate-600">
                Select role, industry, and experience level for a professional draft with 8–10
                bullet points per section — description, responsibilities, qualifications, and
                benefits.
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => void handleGenerateSuggestions()}
            disabled={!canGenerate || aiLoading}
          >
            {aiLoading ? "Generating…" : "Generate with AI"}
          </Button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <JobListingOptionField
            label="Role"
            kind="role"
            value={jobRole}
            onChange={onJobRoleChange}
            options={roleSelectOptions}
            onSaveCustom={saveCustomJobOption}
          />
          <JobListingOptionField
            label="Industry"
            kind="industry"
            value={jobIndustry}
            onChange={onJobIndustryChange}
            options={industrySelectOptions}
            onSaveCustom={saveCustomJobOption}
          />
          <Select
            label="Experience level"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            options={[
              { value: "Entry", label: "Entry (0–2 years)" },
              { value: "Mid", label: "Mid (3–5 years)" },
              { value: "Senior", label: "Senior (6–8 years)" },
              { value: "Lead", label: "Lead (8–12 years)" },
              { value: "Executive", label: "Executive (12+ years)" },
            ]}
          />
        </div>

        {!canGenerate && (
          <p className="mt-3 text-xs text-amber-700">
            Select a role and industry to generate a professional draft. Experience level shapes
            tone, requirements, and salary guidance.
          </p>
        )}
        {aiError && <p className="mt-3 text-xs text-red-600">{aiError}</p>}
        {aiApplied && (
          <p className="mt-3 text-xs text-emerald-700">
            {aiApplied.source === "ai"
              ? "Professional AI draft applied with bullet-point sections — review and edit before publishing."
              : "Professional starter draft applied with bullet-point sections — review and edit before publishing."}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Company"
          placeholder="e.g. Khaleej Tech LLC"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          readOnly={Boolean(businessCompanyName)}
          hint={
            businessCompanyName
              ? "Taken from your Business Profile — update it in account settings to change."
              : undefined
          }
        />
        <Select
          label="Employment type"
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value)}
          options={[
            { value: "Full-time", label: "Full-time" },
            { value: "Part-time", label: "Part-time" },
            { value: "Freelance", label: "Freelance" },
            { value: "Contract", label: "Contract" },
            { value: "Internship", label: "Internship" },
          ]}
        />
        <Select
          label="Work arrangement"
          value={workArrangement}
          onChange={(e) => setWorkArrangement(e.target.value)}
          options={[
            { value: "On-site", label: "On-site" },
            { value: "Hybrid", label: "Hybrid" },
            { value: "Remote", label: "Remote" },
          ]}
        />
        <Input
          type="number"
          label="Min salary (AED)"
          placeholder="18000"
          value={salaryMin}
          onChange={(e) => setSalaryMin(e.target.value)}
        />
        <Input
          type="number"
          label="Max salary (AED)"
          placeholder="26000"
          value={salaryMax}
          onChange={(e) => setSalaryMax(e.target.value)}
        />
      </div>

      <JobApplicationSetupSection
        applicationMethod={applicationMethod}
        onApplicationMethodChange={setApplicationMethod}
        applicationContact={applicationContact}
        onApplicationContactChange={setApplicationContact}
        startDate={startDate}
        onStartDateChange={setStartDate}
        questions={applicationQuestions}
        onQuestionsChange={setApplicationQuestions}
      />

      <PostTextArea
        label={copy.descriptionLabel}
        placeholder={copy.descriptionPlaceholder}
        rows={6}
        value={description}
        onChange={setDescription}
      />

      <PostTextArea
        label={copy.responsibilitiesLabel}
        placeholder={copy.responsibilitiesPlaceholder}
        hint="Use one bullet per line (•). AI generates up to 10 responsibilities."
        value={responsibilities}
        onChange={setResponsibilities}
      />

      <PostTextArea
        label={copy.qualificationsLabel}
        placeholder={copy.qualificationsPlaceholder}
        hint="Use one bullet per line (•). Requirements adjust to the experience level selected above."
        value={qualifications}
        onChange={setQualifications}
      />

      <PostTextArea
        label={copy.benefitsLabel}
        placeholder={copy.benefitsPlaceholder}
        hint="Use one bullet per line (•). Senior roles include enhanced benefits where applicable."
        value={benefits}
        onChange={setBenefits}
      />
    </div>
  );
}

function ServiceDetailsForm({
  serviceCategory,
  onServiceCategoryChange,
  serviceTitle,
  serviceEmirate,
  serviceArea,
}: {
  serviceCategory: ServiceCategory;
  onServiceCategoryChange: (category: ServiceCategory) => void;
  serviceTitle: string;
  serviceEmirate: Emirate;
  serviceArea: string;
}) {
  const copy = getServicePostCopy(serviceCategory);
  const [accountType, setAccountType] = useState<ServiceProviderAccountType>("individual");
  const [providerNameMode, setProviderNameMode] = useState("profile");
  const [customProviderName, setCustomProviderName] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [unit, setUnit] = useState("");
  const [responseTime, setResponseTime] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [coverage, setCoverage] = useState("");
  const [sameDay, setSameDay] = useState("");
  const [tradeLicence, setTradeLicence] = useState("not_applicable");
  const [description, setDescription] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiApplied, setAiApplied] = useState<"ai" | "template" | null>(null);
  const [tutoringLanguages, setTutoringLanguages] = useState<string[]>([]);
  const [teachesLevels, setTeachesLevels] = useState<string[]>([]);
  const [sessionFormat, setSessionFormat] = useState<TutoringSessionFormat>("Both");
  const [mealCuisines, setMealCuisines] = useState<string[]>([]);
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [mealOfferingType, setMealOfferingType] = useState<MealOfferingType>("Single meals");
  const [mealFulfillment, setMealFulfillment] = useState<MealFulfillment>("Both");
  const [pestTypes, setPestTypes] = useState<string[]>([]);
  const isTutorListing = serviceCategory === "Language Tutoring";
  const isMealListing = serviceCategory === "Homemade Meals";
  const isPestListing = serviceCategory === "Pest Control";
  const categoryOptions = isStandaloneServiceCategory(serviceCategory)
    ? ALL_SERVICE_CATEGORIES.filter((c) => c.key === serviceCategory)
    : HOME_SERVICE_CATEGORIES;

  const providerName =
    providerNameMode === "custom"
      ? customProviderName
      : accountType === "business"
        ? copy.businessNamePlaceholder
        : copy.individualNamePlaceholder;

  const formContext: ServiceListingFormContext = {
    category: serviceCategory,
    title: serviceTitle,
    emirate: serviceEmirate,
    area: serviceArea,
    accountType,
    providerName,
    priceFrom,
    unit,
    responseTime,
    yearsExperience,
    coverage,
    sameDay,
    tradeLicence,
    tutoringLanguages: isTutorListing ? tutoringLanguages : undefined,
    teachesLevels: isTutorListing ? teachesLevels : undefined,
    sessionFormat: isTutorListing ? sessionFormat : undefined,
    mealCuisines: isMealListing ? mealCuisines : undefined,
    dietaryTags: isMealListing ? dietaryTags : undefined,
    mealOfferingType: isMealListing ? mealOfferingType : undefined,
    mealFulfillment: isMealListing ? mealFulfillment : undefined,
    pestTypes: isPestListing ? pestTypes : undefined,
  };

  const canGenerate = canGenerateServiceDescription(formContext);

  async function handleGenerateDescription() {
    if (!canGenerate) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const result = await fetchServiceListingDescription(formContext);
      setDescription(result.description);
      setAiApplied(result.source);
    } catch {
      setAiError("Could not generate a description right now. Try again in a moment.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <Heading title={copy.headingTitle} sub={copy.headingSub} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Posting as"
          value={accountType}
          onChange={(e) => setAccountType(e.target.value as ServiceProviderAccountType)}
          options={[
            { value: "individual", label: "Individual — freelancer or sole provider" },
            { value: "business", label: "Business — registered company or team" },
          ]}
        />
        <Select
          label="Category"
          value={serviceCategory}
          onChange={(e) => onServiceCategoryChange(e.target.value as ServiceCategory)}
          options={categoryOptions.map((c) => ({ value: c.key, label: c.label }))}
          disabled={categoryOptions.length === 1}
        />
        <Select
          label={accountType === "business" ? "Business name" : "Display name"}
          value={providerNameMode}
          onChange={(e) => setProviderNameMode(e.target.value)}
          options={[...SERVICE_PROVIDER_NAME_MODES]}
        />
        {providerNameMode === "custom" && (
          <Input
            label="Custom name"
            placeholder={
              accountType === "business"
                ? copy.businessNamePlaceholder
                : copy.individualNamePlaceholder
            }
            value={customProviderName}
            onChange={(e) => setCustomProviderName(e.target.value)}
          />
        )}
        <Select
          label="Price from"
          value={priceFrom}
          onChange={(e) => setPriceFrom(e.target.value)}
          options={[
            { value: "", label: "Select starting price…" },
            ...servicePriceOptions(serviceCategory),
          ]}
        />
        <Select
          label="Pricing unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          options={[
            { value: "", label: "Select unit…" },
            ...serviceUnitOptions(serviceCategory),
          ]}
        />
        <Select
          label="Response time"
          value={responseTime}
          onChange={(e) => setResponseTime(e.target.value)}
          options={[
            { value: "", label: "Select response time…" },
            ...SERVICE_RESPONSE_TIMES,
          ]}
        />
        <Select
          label="Years of experience"
          value={yearsExperience}
          onChange={(e) => setYearsExperience(e.target.value)}
          options={[
            { value: "", label: "Select experience…" },
            ...SERVICE_YEARS_EXPERIENCE,
          ]}
        />
        <Select
          label="Coverage area"
          value={coverage}
          onChange={(e) => setCoverage(e.target.value)}
          options={[
            { value: "", label: "Select coverage…" },
            ...SERVICE_COVERAGE_OPTIONS,
          ]}
        />
        <Select
          label="Same-day availability"
          value={sameDay}
          onChange={(e) => setSameDay(e.target.value)}
          options={[
            { value: "", label: "Select availability…" },
            ...SERVICE_SAME_DAY_OPTIONS,
          ]}
        />
        {accountType === "business" && (
          <Select
            label="Trade licence status"
            value={tradeLicence}
            onChange={(e) => setTradeLicence(e.target.value)}
            options={[...SERVICE_TRADE_LICENCE_OPTIONS]}
          />
        )}
      </div>

      {isTutorListing && (
        <div className="space-y-4 rounded-2xl border border-violet-200/80 bg-violet-50/40 p-5">
          <MultiSelect
            label="Languages you teach"
            options={TUTORING_LANGUAGES.map((lang) => ({ value: lang, label: lang }))}
            value={tutoringLanguages}
            onChange={setTutoringLanguages}
            placeholder="Select languages…"
          />
          <MultiSelect
            label="Levels you teach"
            options={TUTORING_LEVELS.map((level) => ({ value: level, label: level }))}
            value={teachesLevels}
            onChange={setTeachesLevels}
            placeholder="Select levels…"
          />
          <Select
            label="Session format"
            value={sessionFormat}
            onChange={(e) => setSessionFormat(e.target.value as TutoringSessionFormat)}
            options={[
              { value: "Online", label: "Online" },
              { value: "In-person", label: "In-person" },
              { value: "Both", label: "Online & in-person" },
            ]}
          />
        </div>
      )}

      {isMealListing && (
        <div className="space-y-4 rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5">
          <MultiSelect
            label="Cuisines you offer"
            options={MEAL_CUISINES.map((cuisine) => ({ value: cuisine, label: cuisine }))}
            value={mealCuisines}
            onChange={setMealCuisines}
            placeholder="Select cuisines…"
          />
          <MultiSelect
            label="Dietary options"
            options={MEAL_DIETARY_TAGS.map((tag) => ({ value: tag, label: tag }))}
            value={dietaryTags}
            onChange={setDietaryTags}
            placeholder="Select dietary options…"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="What do you sell?"
              value={mealOfferingType}
              onChange={(e) => setMealOfferingType(e.target.value as MealOfferingType)}
              options={MEAL_OFFERING_TYPES.map((v) => ({ value: v, label: v }))}
            />
            <Select
              label="Pickup or delivery"
              value={mealFulfillment}
              onChange={(e) => setMealFulfillment(e.target.value as MealFulfillment)}
              options={MEAL_FULFILLMENT_OPTIONS.map((v) => ({ value: v, label: v }))}
            />
          </div>
        </div>
      )}

      {isPestListing && (
        <div className="rounded-2xl border border-lime-200/80 bg-lime-50/40 p-5">
          <MultiSelect
            label="Pests you treat"
            options={PEST_TYPES.map((pest) => ({ value: pest, label: pest }))}
            value={pestTypes}
            onChange={setPestTypes}
            placeholder="Select pest types…"
          />
        </div>
      )}

      <div className="rounded-2xl border border-brand-200/80 bg-gradient-to-br from-brand-50/70 to-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">AI description assistant</p>
              <p className="mt-1 text-xs text-slate-600">
                Fill in pricing, coverage, and category details above — then generate a professional
                service description you can edit before publishing.
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => void handleGenerateDescription()}
            disabled={!canGenerate || aiLoading}
          >
            {aiLoading ? "Generating…" : "Generate with AI"}
          </Button>
        </div>

        {!canGenerate && (
          <p className="mt-3 text-xs text-amber-700">
            Complete the basics step (title, emirate, area) and select price, unit, response time,
            and experience to enable AI generation.
          </p>
        )}
        {aiError && <p className="mt-3 text-xs text-red-600">{aiError}</p>}
        {aiApplied && (
          <p className="mt-3 text-xs text-emerald-700">
            {aiApplied === "ai"
              ? "AI draft applied — review and edit before publishing."
              : "Professional starter draft applied — review and edit before publishing."}
          </p>
        )}
      </div>

      <PostTextArea
        label={copy.descriptionLabel}
        placeholder={copy.descriptionPlaceholder}
        rows={6}
        value={description}
        onChange={setDescription}
      />
    </div>
  );
}

function PhotosStep({
  mode,
  serviceCategory,
  accommodationIntent = "rental",
}: {
  mode: Mode;
  serviceCategory: ServiceCategory | null;
  accommodationIntent?: AccommodationListingIntent;
}) {
  const copy = getPhotosCopy(mode, serviceCategory, accommodationIntent);

  return (
    <div className="space-y-5">
      <Heading title="Upload photos" sub={copy.headingSub} />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <button
            key={i}
            className="group aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-brand-400 hover:bg-brand-50/40"
          >
            <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-slate-500 group-hover:text-brand-700">
              <Upload className="h-5 w-5" />
              {i === 0 ? copy.coverPhotoLabel : `${copy.photoHint} ${i + 1}`}
            </div>
          </button>
        ))}
      </div>
      <div className="flex items-start gap-2 rounded-xl bg-brand-50/60 p-4 text-sm text-brand-900">
        <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <span>{copy.aiHint}</span>
      </div>
    </div>
  );
}

function PricingStep({ mode }: { mode: Mode }) {
  const [plan, setPlan] = useState(0);
  const isJob = mode === "job";
  const plans = [
    {
      title: isJob ? "Standard job post" : "Free with commission",
      price: 0,
      sub: isJob ? "Listed for 30 days" : "Pay only when you close a deal",
      desc: isJob
        ? "Reach candidates across the UAE. Edit or renew from your dashboard anytime."
        : "Standard placement. Platform collects fixed commission after successful deal.",
    },
    {
      title: isJob ? "Featured job" : "Boost — Featured listing",
      price: isJob ? 99 : 49,
      sub: isJob ? "14 days featured" : "7 days",
      desc: isJob
        ? "Top of category search, homepage rotation, and priority in job alerts."
        : "Top of category, homepage rotation, analytics dashboard.",
    },
    {
      title: isJob ? "Urgent hire" : "Pay per post",
      price: isJob ? 149 : 19,
      sub: isJob ? "7 days · urgent badge" : "Listed for 30 days",
      desc: isJob
        ? "Urgent badge, email blast to matching candidates, and boosted placement."
        : "Best for one-off ads. No commission charged at all.",
    },
  ];
  return (
    <div className="space-y-5">
      <Heading title="Choose a plan" sub="Free to start. Upgrade for more visibility." />
      <div className="space-y-3">
        {plans.map((p, i) => (
          <button
            key={p.title}
            onClick={() => setPlan(i)}
            className={cn(
              "flex w-full items-start gap-4 rounded-2xl border-2 p-5 text-left transition",
              plan === i
                ? "border-brand-600 bg-brand-50/40"
                : "border-slate-200 hover:border-slate-300"
            )}
          >
            <div
              className={cn(
                "mt-1 h-5 w-5 flex-shrink-0 rounded-full border-2",
                plan === i ? "border-brand-600 bg-brand-600" : "border-slate-300"
              )}
            >
              {plan === i && (
                <CheckCircle2 className="h-full w-full text-white" strokeWidth={2.5} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-semibold">{p.title}</h4>
                <div className="text-right">
                  <div className="font-bold">{p.price === 0 ? "Free" : formatPrice(p.price)}</div>
                  <div className="text-xs text-slate-500">{p.sub}</div>
                </div>
              </div>
              <p className="mt-1 text-sm text-slate-600">{p.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ReviewStep({
  mode,
  businessCompanyName,
}: {
  mode: Mode;
  businessCompanyName?: string;
}) {
  const isJob = mode === "job";

  return (
    <div className="space-y-5">
      <Heading
        title="Final review"
        sub={
          isJob
            ? businessCompanyName
              ? `Publishing on behalf of ${businessCompanyName} via your Business Profile. Check role details before going live.`
              : "Check the role details, description, and requirements before publishing."
            : "Make sure everything looks good — you can edit later from your dashboard."
        }
      />
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h4 className="font-semibold">
          {isJob ? "Employer agreement" : "Auto-generated agreement"}
        </h4>
        <p className="mt-1 text-sm text-slate-600">
          {isJob
            ? "By publishing this job you confirm the role is genuine, complies with UAE labour law, and that salary and benefits listed are accurate. We'll email a copy to "
            : "By publishing this listing you agree to Khaleej's commission terms and a binding deal contract. We'll email you a copy at "}
          <strong>you@khaleej.ae</strong>.
        </p>
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        {isJob
          ? "I confirm this job posting is accurate and I am authorised to hire on behalf of this company."
          : "I have read and accept the binding deal contract and platform commission of 5%."}
      </label>
      <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <span>
          Your phone and Emirates ID will be verified before this listing is published. This
          usually takes under 5 minutes.
        </span>
      </div>
    </div>
  );
}

function Heading({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{sub}</p>
    </div>
  );
}
