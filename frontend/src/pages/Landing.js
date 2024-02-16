import { Dialog, RadioGroup } from "@headlessui/react";
import { Bars3Icon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Skeleton } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link, useNavigate } from "react-router-dom";
import StrapiService from "../service/StrapiService";

const frequencies = [
  { value: "monthly", label: "Monthly", priceSuffix: "/month" },
  { value: "annually", label: "Annually", priceSuffix: "/year" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const navigation = [
  //   { name: "Product", href: "#" },
  //   { name: "Features", href: "#" },
  //   { name: "Marketplace", href: "#" },
  //   { name: "Company", href: "#" },
];

const getCachedLandingPageData = () => {
  if (!localStorage.landingPageData) return null;
  let data = null;

  try {
    data = JSON.parse(localStorage.landingPageData);
  } catch (e) {}

  return data;
};

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [frequency, setFrequency] = useState(frequencies[0]);
  const navigate = useNavigate();

  const [landingPageData, setLandingPageData] = useState(
    getCachedLandingPageData() ?? null
  );

  useEffect(() => {
    StrapiService.landingPage().then(({ data }) => {
      setLandingPageData(data);
      localStorage.landingPageData = JSON.stringify(data);
    });
  }, []);

  if (!landingPageData) return <Skeleton active />;

  return (
    <div className="bg-white">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5">
              <img className="h-16 w-auto" src="/logo-long-black.png" alt="" />
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Link
              to="/auth/login"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>
        <Dialog
          as="div"
          className="lg:hidden"
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
        >
          <div className="fixed inset-0 z-50" />
          <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link to="/" className="-m-1.5 p-1.5">
                <img
                  className="h-16 w-auto"
                  src="/logo-long-black.png"
                  alt=""
                />
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6">
                  <Link
                    to="/auth/login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    Log in
                  </Link>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </header>
      <main>
        <div className="relative isolate">
          <svg
            className="absolute inset-x-0 top-0 -z-10 h-[64rem] w-full stroke-gray-200 [mask-image:radial-gradient(32rem_32rem_at_center,white,transparent)]"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="1f932ae7-37de-4c0a-a8b0-a6e3b4d44b84"
                width={200}
                height={200}
                x="50%"
                y={-1}
                patternUnits="userSpaceOnUse"
              >
                <path d="M.5 200V.5H200" fill="none" />
              </pattern>
            </defs>
            <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
              <path
                d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
                strokeWidth={0}
              />
            </svg>
            <rect
              width="100%"
              height="100%"
              strokeWidth={0}
              fill="url(#1f932ae7-37de-4c0a-a8b0-a6e3b4d44b84)"
            />
          </svg>
          <div
            className="absolute left-1/2 right-0 top-0 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48"
            aria-hidden="true"
          >
            <div
              className="aspect-[801/1036] w-[50.0625rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
              style={{
                clipPath:
                  "polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)",
              }}
            />
          </div>
          <div className="overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 pb-32 pt-36 sm:pt-60 lg:px-8 lg:pt-32">
              <div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
                <div className="relative w-full max-w-xl lg:shrink-0 xl:max-w-2xl">
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                    {landingPageData?.landingpage?.HeroTitle}
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-gray-600 sm:max-w-md lg:max-w-none">
                    {landingPageData?.landingpage?.HeroText}
                  </p>
                  <div className="mt-10 flex items-center gap-x-6">
                    <Link
                      to={landingPageData?.landingpage?.HeroCTAMainLink}
                      className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      {landingPageData?.landingpage?.HeroCTAMainText}
                    </Link>
                    {landingPageData?.landingpage?.HeroCTASecondaryDisplay && (
                      <a
                        href={
                          landingPageData?.landingpage?.HeroCTASecondaryLink
                        }
                        target="_blank"
                        className="text-sm font-semibold leading-6 text-gray-900"
                      >
                        {landingPageData?.landingpage?.HeroCTASecondaryText}{" "}
                        <span aria-hidden="true">→</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
                  {landingPageData?.landingpage?.HeroImages?.[0]?.url && (
                    <div className="ml-auto w-44 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-80 lg:order-last lg:pt-36 xl:order-none xl:pt-80">
                      <div className="relative">
                        <img
                          src={
                            process.env.REACT_APP_STRAPI_URL +
                            landingPageData?.landingpage?.HeroImages?.[0]?.url
                          }
                          alt=""
                          className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                        />
                        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                      </div>
                    </div>
                  )}

                  <div className="mr-auto w-44 flex-none space-y-8 sm:mr-0 sm:pt-52 lg:pt-36">
                    {landingPageData?.landingpage?.HeroImages?.[1]?.url && (
                      <div className="relative">
                        <img
                          src={
                            process.env.REACT_APP_STRAPI_URL +
                            landingPageData?.landingpage?.HeroImages?.[1]?.url
                          }
                          alt=""
                          className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                        />
                        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                      </div>
                    )}
                    {landingPageData?.landingpage?.HeroImages?.[2]?.url && (
                      <div className="relative">
                        <img
                          src={
                            process.env.REACT_APP_STRAPI_URL +
                            landingPageData?.landingpage?.HeroImages?.[2]?.url
                          }
                          alt=""
                          className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                        />
                        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                      </div>
                    )}
                  </div>
                  <div className="w-44 flex-none space-y-8 pt-32 sm:pt-0">
                    {landingPageData?.landingpage?.HeroImages?.[3]?.url && (
                      <div className="relative">
                        <img
                          src={
                            process.env.REACT_APP_STRAPI_URL +
                            landingPageData?.landingpage?.HeroImages?.[3]?.url
                          }
                          alt=""
                          className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                        />
                        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                      </div>
                    )}
                    {landingPageData?.landingpage?.HeroImages?.[4]?.url && (
                      <div className="relative">
                        <img
                          src={
                            process.env.REACT_APP_STRAPI_URL +
                            landingPageData?.landingpage?.HeroImages?.[4]?.url
                          }
                          alt=""
                          className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                        />
                        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div>
              <h2 className="text-base font-semibold leading-7 text-indigo-600">
                {landingPageData?.landingpage?.FeaturesTag}
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {landingPageData?.landingpage?.FeaturesTitle}
              </p>
              <p className="mt-6 text-base leading-7 text-gray-600">
                {landingPageData?.landingpage?.FeaturesText}
              </p>
            </div>
            <dl className="col-span-2 grid grid-cols-1 gap-x-8 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:gap-y-16">
              {landingPageData?.features?.map?.((feature) => (
                <div key={feature._id} className="relative pl-9">
                  <dt className="font-semibold text-gray-900">
                    <CheckIcon
                      className="absolute left-0 top-1 h-5 w-5 text-indigo-500"
                      aria-hidden="true"
                    />
                    {feature.Title}
                  </dt>
                  <dd className="mt-2">{feature.Description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {landingPageData?.landingpage?.ExpoTitle}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
              {landingPageData?.landingpage?.ExpoText}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to={landingPageData?.landingpage?.ExpoCTAMainLink}
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {landingPageData?.landingpage?.ExpoCTAMainText}
              </Link>
              {landingPageData?.landingpage?.ExpoCTASecondaryActive && (
                <Link
                  to={landingPageData?.landingpage?.ExpoCTASecondaryLink}
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  {landingPageData?.landingpage?.ExpoCTASecondaryText}{" "}
                  <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">
              {landingPageData?.landingpage?.PricingTag}
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {landingPageData?.landingpage?.PricingTitle}
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
            {landingPageData?.landingpage?.PricingText}
          </p>
          <div className="mt-16 flex justify-center">
            <RadioGroup
              value={frequency}
              onChange={setFrequency}
              className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200"
            >
              <RadioGroup.Label className="sr-only">
                Payment frequency
              </RadioGroup.Label>
              {frequencies.map((option) => (
                <RadioGroup.Option
                  key={option.value}
                  value={option}
                  className={({ checked }) =>
                    classNames(
                      checked ? "bg-indigo-600 text-white" : "text-gray-500",
                      "cursor-pointer rounded-full px-2.5 py-1"
                    )
                  }
                >
                  <span>{option.label}</span>
                </RadioGroup.Option>
              ))}
            </RadioGroup>
          </div>
          <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {landingPageData?.pricings?.map?.((tier) => (
              <div
                key={tier._id}
                className={classNames(
                  tier.Popular
                    ? "ring-2 ring-indigo-600"
                    : "ring-1 ring-gray-200",
                  "rounded-3xl p-8 xl:p-10"
                )}
              >
                <div className="flex items-center justify-between gap-x-4">
                  <h3
                    id={tier._id}
                    className={classNames(
                      tier.Popular ? "text-indigo-600" : "text-gray-900",
                      "text-lg font-semibold leading-8"
                    )}
                  >
                    {tier.Title}
                  </h3>
                  {tier.Popular ? (
                    <p className="rounded-full bg-indigo-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-indigo-600">
                      Most popular
                    </p>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {tier.Description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-sm font-semibold leading-6 text-gray-600">
                    $
                  </span>
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    {frequency.value === "monthly"
                      ? tier.PriceMonth
                      : tier.PriceAnnual}
                  </span>
                </p>
                <a
                  //   href={tier.href}
                  href={"https://stripe.com/"}
                  target="_blank"
                  aria-describedby={tier._id}
                  className={classNames(
                    tier.Popular
                      ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
                      : "text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300",
                    "mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  )}
                >
                  Buy plan
                </a>
                <ul
                  role="list"
                  className="mt-8 space-y-3 text-sm leading-6 text-gray-600 xl:mt-10"
                >
                  <li className="flex gap-x-3">
                    <CheckIcon
                      className="h-6 w-5 flex-none text-indigo-600"
                      aria-hidden="true"
                    />
                    {tier.MaxPrograms > 99999999
                      ? `Unlimited programs`
                      : `Manage up to ${tier.MaxPrograms} programs`}
                  </li>
                  <li className="flex gap-x-3">
                    <CheckIcon
                      className="h-6 w-5 flex-none text-indigo-600"
                      aria-hidden="true"
                    />
                    {tier.MaxBeneficiaries > 99999999
                      ? `Unlimited beneficiaries`
                      : `Engage up to ${tier.MaxBeneficiaries} beneficiaries`}
                  </li>
                  <li className="flex gap-x-3">
                    <CheckIcon
                      className="h-6 w-5 flex-none text-indigo-600"
                      aria-hidden="true"
                    />
                    {tier.Analytics}
                  </li>
                  <li className="flex gap-x-3">
                    <CheckIcon
                      className="h-6 w-5 flex-none text-indigo-600"
                      aria-hidden="true"
                    />
                    {tier.Support}
                  </li>
                  {tier.Additional1 && (
                    <li className="flex gap-x-3">
                      <CheckIcon
                        className="h-6 w-5 flex-none text-indigo-600"
                        aria-hidden="true"
                      />
                      {tier.Additional1}
                    </li>
                  )}
                  {tier.Additional2 && (
                    <li className="flex gap-x-3">
                      <CheckIcon
                        className="h-6 w-5 flex-none text-indigo-600"
                        aria-hidden="true"
                      />
                      {tier.Additional2}
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            <h2 className="inline sm:block">
              {landingPageData?.landingpage?.NewsletterText}
            </h2>{" "}
          </div>
          <form
            className="mt-10 max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              window.open("https://www.getresponse.com", "_blank");
            }}
          >
            <div className="flex gap-x-4">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="min-w-0 flex-auto rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Enter your email"
              />
              <button
                type="submit"
                className="flex-none rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Subscribe
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-gray-900">
              We care about your data. Read our{" "}
              <a
                href="https://termly.io/"
                target="_blank"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                privacy&nbsp;policy
              </a>
              .
            </p>
          </form>
        </div>
      </div>

      <div className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2850&q=80&blend=111827&blend-mode=multiply&sat=-100&exp=15"
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div
            className="absolute -bottom-8 -left-96 -z-10 transform-gpu blur-3xl sm:-bottom-64 sm:-left-40 lg:-bottom-32 lg:left-8 xl:-left-10"
            aria-hidden="true"
          >
            <div
              className="aspect-[1266/975] w-[79.125rem] bg-gradient-to-tr from-[#ff4694] to-[#776fff] opacity-20"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
            <h2 className="text-base font-semibold leading-8 text-indigo-400">
              {landingPageData?.landingpage?.OurStatsTag}
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {landingPageData?.landingpage?.OurStatsTitle}
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              {landingPageData?.landingpage?.OurStatsDescription}
            </p>
          </div>
          <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 text-white sm:mt-20 sm:grid-cols-2 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-4">
            {landingPageData?.stats?.map?.((stat) => (
              <div
                key={stat._id}
                className="flex flex-col gap-y-3 border-l border-white/10 pl-6"
              >
                <dt className="text-sm leading-6">{stat.Description}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight">
                  {stat.Stat}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="relative isolate bg-white pb-32 pt-24 sm:pt-32">
        <div
          className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl"
          aria-hidden="true"
        >
          <div
            className="ml-[max(50%,38rem)] aspect-[1313/771] w-[82.0625rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
        <div
          className="absolute inset-x-0 top-0 -z-10 flex transform-gpu overflow-hidden pt-32 opacity-25 blur-3xl sm:pt-40 xl:justify-end"
          aria-hidden="true"
        >
          <div
            className="ml-[-22rem] aspect-[1313/771] w-[82.0625rem] flex-none origin-top-right rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] xl:ml-0 xl:mr-[calc(50%-12rem)]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-lg font-semibold leading-8 tracking-tight text-indigo-600">
              {landingPageData?.landingpage?.TestimonialTag}
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {landingPageData?.landingpage?.TestimonialTitle}
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-1 gap-8 text-sm leading-6 text-gray-900 sm:mt-20 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-flow-col xl:grid-cols-4">
            <figure className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-900/5 sm:col-span-2 xl:col-start-2 xl:row-end-1">
              <blockquote className="p-6 text-lg font-semibold leading-7 tracking-tight text-gray-900 sm:p-12 sm:text-xl sm:leading-8">
                <p>{`“${landingPageData?.testimonials?.[0].Testimonial}”`}</p>
              </blockquote>
              <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-4 border-t border-gray-900/10 px-6 py-4 sm:flex-nowrap">
                <img
                  className="h-10 w-10 flex-none rounded-full bg-gray-50"
                  src={
                    process.env.REACT_APP_STRAPI_URL +
                      landingPageData?.testimonials?.[0]?.AuthorImage?.[0]
                        ?.url ??
                    landingPageData?.testimonials?.[0]?.AuthorImage?.url
                  }
                  alt=""
                />
                <div className="flex-auto">
                  <div className="font-semibold">
                    {landingPageData?.testimonials?.[0].Authorname}
                  </div>
                  <div className="text-gray-600">{`@${landingPageData?.testimonials?.[0].AuthorTag}`}</div>
                </div>
                <img
                  className="h-10 w-auto flex-none"
                  src={
                    process.env.REACT_APP_STRAPI_URL +
                      landingPageData?.testimonials?.[0]?.AuthorCompanyLogo?.[0]
                        ?.url ??
                    landingPageData?.testimonials?.[0]?.AuthorCompanyLogo?.url
                  }
                  alt=""
                />
              </figcaption>
            </figure>
            {[
              [landingPageData?.testimonials?.slice?.(1, 3)],
              [landingPageData?.testimonials?.slice?.(3, 5)],
            ].map((columnGroup, columnGroupIdx) => (
              <div
                key={columnGroupIdx}
                className="space-y-8 xl:contents xl:space-y-0"
              >
                {columnGroup?.map?.((column, columnIdx) => (
                  <div
                    key={columnIdx}
                    className={classNames(
                      (columnGroupIdx === 0 && columnIdx === 0) ||
                        (columnGroupIdx === 1 &&
                          columnIdx === columnGroup.length - 1)
                        ? "xl:row-span-2"
                        : "xl:row-start-1",
                      "space-y-8"
                    )}
                  >
                    {column.map((testimonial) => (
                      <figure
                        key={testimonial._id}
                        className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5"
                      >
                        <blockquote className="text-gray-900">
                          <p>{`“${testimonial.Testimonial}”`}</p>
                        </blockquote>
                        <figcaption className="mt-6 flex items-center gap-x-4">
                          <img
                            className="h-10 w-10 rounded-full bg-gray-50"
                            src={
                              process.env.REACT_APP_STRAPI_URL +
                                testimonial?.AuthorImage?.[0]?.url ??
                              testimonial?.AuthorImage?.url
                            }
                            alt=""
                          />
                          <div>
                            <div className="font-semibold">
                              {testimonial.Authorname}
                            </div>
                            <div className="text-gray-600">{`@${testimonial.AuthorTag}`}</div>
                          </div>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {landingPageData?.landingpage?.BlogTitle}
            </h2>
            <p className="mt-2 text-lg leading-8 text-gray-600">
              {landingPageData?.landingpage?.BlogText}
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {landingPageData?.blogs?.slice?.(0, 3)?.map?.((post) => (
              <article
                key={post._id}
                className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-80 sm:pt-48 lg:pt-80"
                onClick={() => navigate(`/blog/${post._id}`)}
              >
                <img
                  src={process.env.REACT_APP_STRAPI_URL + post.Image?.[0]?.url}
                  alt=""
                  className="absolute inset-0 -z-10 h-full w-full object-cover"
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
                <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" />

                <div className="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm leading-6 text-gray-300">
                  <time dateTime={post.published_at} className="mr-8">
                    {moment(post.published_at).format("Do MMM, YYYY")}
                  </time>
                  <div className="-ml-4 flex items-center gap-x-4">
                    {/* <svg
                      viewBox="0 0 2 2"
                      className="-ml-0.5 h-0.5 w-0.5 flex-none fill-white/50"
                    >
                      <circle cx={1} cy={1} r={1} />
                    </svg> */}
                    {/* <div className="flex gap-x-2.5">
                      {post.author.name}
                    </div> */}
                  </div>
                </div>
                <h3 className="mt-3 text-lg font-semibold leading-6 text-white">
                  <Link to={`/blog/${post._id}`}>
                    <span className="absolute inset-0" />
                    {post.Title}
                  </Link>
                </h3>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white py-12 sm:py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-4xl">
            <div className="mt-4 space-y-20 lg:mt-20 lg:space-y-20">
              {landingPageData?.blogs?.slice?.(3)?.map?.((post) => (
                <article
                  key={post._id}
                  className="relative isolate flex flex-col gap-8 lg:flex-row"
                  onClick={() => navigate(`/blog/${post._id}`)}
                >
                  <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-square lg:w-64 lg:shrink-0">
                    <img
                      src={
                        process.env.REACT_APP_STRAPI_URL + post.Image?.[0]?.url
                      }
                      alt=""
                      className="absolute inset-0 h-full w-full rounded-2xl bg-gray-50 object-cover"
                    />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                  </div>
                  <div>
                    <div className="flex items-center gap-x-4 text-xs">
                      <time
                        dateTime={post.published_at}
                        className="text-gray-500"
                      >
                        {moment(post.published_at).format("Do MMM, YYYY")}
                      </time>
                      <Link
                        // to={post.category?.[0]?.href}
                        className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
                      >
                        {post.category?.[0]?.Title}
                      </Link>
                    </div>
                    <div className="group relative max-w-xl">
                      <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                        <Link to={`/blog/${post._id}`}>
                          <span className="absolute inset-0" />
                          {post.Title}
                        </Link>
                      </h3>
                      <p className="mt-5 text-sm leading-6 text-gray-600">
                        {post.Description}
                      </p>
                    </div>
                    <div className="mt-6 flex border-t border-gray-900/5 pt-6">
                      <div className="relative flex items-center gap-x-4">
                        {/* <div className="text-sm leading-6">
                          <p className="font-semibold text-gray-900">
                            <Link to={post.author.href}>
                              <span className="absolute inset-0" />
                              {post.author.name}
                            </Link>
                          </p>
                          <p className="text-gray-600">{post.author.role}</p>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {landingPageData?.landingpage?.OurTeamTitle}
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              {landingPageData?.landingpage?.OurTeamText}
            </p>
          </div>
          <ul
            role="list"
            className="mx-auto mt-20 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:mx-0 lg:max-w-none lg:grid-cols-5 xl:grid-cols-6"
          >
            {landingPageData?.team?.map?.((person) => (
              <li
                key={person._id}
                className="cursor-pointer"
                onClick={() =>
                  window.open("https://www.linkedin.com/in/", "_blank")
                }
              >
                <img
                  className="mx-auto h-24 w-24 rounded-full"
                  src={
                    process.env.REACT_APP_STRAPI_URL + person.Image?.[0]?.url
                  }
                  alt=""
                />
                <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight text-gray-900">
                  {person.FullName}
                </h3>
                <p className="text-sm leading-6 text-gray-600">{person.Role}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center text-lg font-semibold leading-8 text-gray-900">
            {landingPageData?.landingpage?.TrustedText}
          </h2>
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
            {landingPageData?.landingpage?.TrustedLogos?.map?.((logo) => (
              <img
                key={logo._id}
                className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
                src={process.env.REACT_APP_STRAPI_URL + logo.url}
                alt={logo.alternativeText}
                width={158}
                height={48}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
              {landingPageData?.landingpage?.FAQTitle}
            </h2>

            <p className="mt-6 text-base leading-7 text-gray-600">
              <ReactMarkdown>
                {landingPageData?.landingpage?.FAQText}
              </ReactMarkdown>
            </p>
          </div>
          <div className="mt-20">
            <dl className="space-y-16 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-16 sm:space-y-0 lg:gap-x-10">
              {landingPageData?.faqs?.map?.((faq) => (
                <div key={faq._id}>
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    {faq.Question}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600">
                    {faq.Answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
