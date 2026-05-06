import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { LandingPageNavbar } from "@/components/LandingPageNavbar";

export default function Home() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden font-display">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* TopNavBar */}
            {/* TopNavBar */}
            <LandingPageNavbar />
            <main className="flex flex-col gap-16 md:gap-20">
              {/* HeroSection */}
              <div className="@container mt-10">
                <div className="flex flex-col gap-6 px-4 py-10 @[480px]:gap-8 @[864px]:flex-row">
                  <div className="flex flex-col gap-6 @[480px]:min-w-[400px] @[480px]:gap-8 @[864px]:justify-center">
                    <div className="flex flex-col gap-2 text-left">
                      <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">Advertise on real people's screen</h1>
                      <h2 className="text-white/80 text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">Facts: People only buy from people they know, like or trust. Reach millions of potential customers, Join Paypulse and start advertising today.</h2>
                    </div>
                    <Link href="/advertise">
                      <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-primary text-[#112215] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]">
                        <span className="truncate">Start Advertising</span>
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                  <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg @[480px]:h-auto @[480px]:min-w-[400px] @[864px]:w-full" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDGzRhSZb0nacjg7bG8maCBXACYRYf6uL9B3ITYRg5erQMMWEGU72ZB_AS11CZjeRgi8Fl0MEg48Gux_1pWilJ65cS8JhBb_0PTmvV8YmGAPvMcD7CGFzGDwQLlLs0H6VYnHTYfY0dbSc4BggdQ3326nUy2cgfWpFo0vz2vPl6rZNDgR5nI6nbPQAaL1rAjJ8vUUbOHiUMB8_4OFU7Nss001InbxdfhSX4prp3UA_VqqAgKBTHh4aV6EwfaRAf14jtNQLZgQrTtoXKF')" }}></div>
                </div>
              </div>

              {/* Earner CTA Section */}
              <div className="px-4">
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_0_40px_rgba(46,176,91,0.1)]">
                  <div className="flex flex-col gap-4 max-w-2xl">
                    <h2 className="text-white text-2xl md:text-3xl font-bold leading-tight">
                      Make Money Every Day
                    </h2>
                    <p className="text-[#92c9a0] text-base md:text-lg font-medium leading-relaxed">
                      Earn Up To $5 USD Per task, Earn commissions, Turn your connections into cash and earn a 50% on Referral Bonus. Join our network and start building your financial future today.
                    </p>
                  </div>
                  <Link href="/signup" className="shrink-0 w-full md:w-auto">
                    <button className="flex w-full md:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-[#2eb05b] text-[#112215] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#3cd172] transition-colors shadow-lg shadow-[#2eb05b]/20">
                      <span className="truncate">Start Earning Now</span>
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </button>
                  </Link>
                </div>
              </div>
              {/* FeatureSection */}
              <div id="features" className="flex flex-col gap-10 px-4 py-10 @container">
                <div className="flex flex-col gap-4 text-center items-center">
                  <h1 className="text-white tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">Unlock Your Earning Potential</h1>
                  <p className="text-white/80 text-base font-normal leading-normal max-w-[720px]">Discover the core pillars of the Paypulse platform designed to help you succeed.</p>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 p-0">
                  
                  <div className="flex flex-1 gap-4 rounded-lg border border-[#32673f] bg-[#193320] p-6 flex-col">
                    <div className="text-primary"><span className="material-symbols-outlined text-3xl">assignment_turned_in</span></div>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-white text-lg font-bold leading-tight">Complete Tasks for Cash</h2>
                      <p className="text-[#92c9a0] text-sm font-normal leading-normal">Get paid for completing simple online tasks from our diverse marketplace.</p>
                    </div>
                  </div>
                  <div className="flex flex-1 gap-4 rounded-lg border border-[#32673f] bg-[#193320] p-6 flex-col">
                    <div className="text-primary"><span className="material-symbols-outlined text-3xl">group_add</span></div>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-white text-lg font-bold leading-tight">Earn with Referrals</h2>
                      <p className="text-[#92c9a0] text-sm font-normal leading-normal">Earn passive income through our powerful multi-level referral system.</p>
                    </div>
                  </div>
                  <div className="flex flex-1 gap-4 rounded-lg border border-[#32673f] bg-[#193320] p-6 flex-col">
                    <div className="text-primary"><span className="material-symbols-outlined text-3xl">ads_click</span></div>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-white text-lg font-bold leading-tight">Create Ad Campaigns</h2>
                      <p className="text-[#92c9a0] text-sm font-normal leading-normal">Launch targeted advertising campaigns in minutes to reach your ideal audience.</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* How It Works Section */}
              <div className="flex flex-col gap-4">
                <h2 className="text-white text-center text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">How It Works</h2>
                <div className="grid grid-cols-[40px_1fr] gap-x-2 px-4">
                  <div className="flex flex-col items-center gap-1 pt-3">
                    <div className="text-primary"><span className="material-symbols-outlined text-3xl">how_to_reg</span></div>
                    <div className="w-[1.5px] bg-[#32673f] h-2 grow"></div>
                  </div>
                  <div className="flex flex-1 flex-col py-3">
                    <p className="text-white text-lg font-medium leading-normal">Sign Up for Free</p>
                    <p className="text-[#92c9a0] text-base font-normal leading-normal">Create your account in just a few clicks and get instant access to the platform.</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-[1.5px] bg-[#32673f] h-2"></div>
                    <div className="text-primary"><span className="material-symbols-outlined text-3xl">trending_up</span></div>
                    <div className="w-[1.5px] bg-[#32673f] h-2 grow"></div>
                  </div>
                  <div className="flex flex-1 flex-col py-3">
                    <p className="text-white text-lg font-medium leading-normal">Earn &amp; Advertise</p>
                    <p className="text-[#92c9a0] text-base font-normal leading-normal">Start referring users and completing tasks, or launch your first ad campaign.</p>
                  </div>
                  <div className="flex flex-col items-center gap-1 pb-3">
                    <div className="w-[1.5px] bg-[#32673f] h-2"></div>
                    <div className="text-primary"><span className="material-symbols-outlined text-3xl">payments</span></div>
                  </div>
                  <div className="flex flex-1 flex-col py-3">
                    <p className="text-white text-lg font-medium leading-normal">Get Paid Securely</p>
                    <p className="text-[#92c9a0] text-base font-normal leading-normal">Easily withdraw your earnings or reinvest your credits for further growth.</p>
                  </div>
                </div>
              </div>
              {/* Pricing Table */}
              <div id="pricing" className="flex flex-col gap-10 px-4 py-10 @container">
                <div className="flex flex-col gap-4 text-center items-center">
                  <h1 className="text-white tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">Choose Your Plan</h1>
                  <p className="text-white/80 text-base font-normal leading-normal max-w-[720px]">Start for free or unlock powerful features with our Pro and Business plans.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Free Plan */}
                  <div className="flex flex-col gap-6 rounded-lg border border-[#32673f] bg-[#193320] p-6">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-white text-xl font-bold">Lite</h3>
                      <p className="text-white text-4xl font-bold">$12.00<span className="text-base font-normal text-white/70">/month</span></p>
                      <p className="text-[#92c9a0] text-sm">Perfect for getting started and exploring the platform.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">check_circle</span><span className="text-white/90 text-sm">Up to 50 referrals</span></div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">check_circle</span><span className="text-white/90 text-sm">Basic dashboard</span></div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">check_circle</span><span className="text-white/90 text-sm">Standard Support</span></div>
                    </div>
                    <Link href="/signup" className="mt-auto">
                      <button className="flex w-full min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#23482c] text-white text-sm font-bold leading-normal tracking-[0.015em]"><span className="truncate">Choose Plan</span></button>
                    </Link>
                  </div>
                  {/* Pro Plan */}
                  <div className="flex flex-col gap-6 rounded-lg border-2 border-primary bg-[#193320] p-6 relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-[#112215] text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-white text-xl font-bold">Pro</h3>
                      <p className="text-white text-4xl font-bold">$21.00<span className="text-base font-normal text-white/70">/month</span></p>
                      <p className="text-[#92c9a0] text-sm">Ideal for serious earners and advertisers looking to scale.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">check_circle</span><span className="text-white/90 text-sm">Unlimited referrals</span></div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">check_circle</span><span className="text-white/90 text-sm">Advanced dashboard</span></div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">check_circle</span><span className="text-white/90 text-sm">Marketing toolkit</span></div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">check_circle</span><span className="text-white/90 text-sm">Priority Support</span></div>
                    </div>
                    <Link href="/signup" className="mt-auto">
                      <button className="flex w-full min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-[#112215] text-sm font-bold leading-normal tracking-[0.015em]"><span className="truncate">Choose Plan</span></button>
                    </Link>
                  </div>
                  {/* Premium Plan */}
                  <div className="flex flex-col gap-6 rounded-lg border border-[#32673f] bg-[#193320] p-6">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-white text-xl font-bold">Premium</h3>
                      <p className="text-white text-4xl font-bold">$50.00<span className="text-base font-normal text-white/70">/month</span></p>
                      <p className="text-[#92c9a0] text-sm">For agencies and businesses with high-volume needs.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">check_circle</span><span className="text-white/90 text-sm">Unlimited referrals</span></div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">check_circle</span><span className="text-white/90 text-sm">Premium features</span></div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">check_circle</span><span className="text-white/90 text-sm">Exclusive webinars</span></div>
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">check_circle</span><span className="text-white/90 text-sm">Dedicated Support</span></div>
                    </div>
                    <Link href="/signup" className="mt-auto">
                      <button className="flex w-full min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#23482c] text-white text-sm font-bold leading-normal tracking-[0.015em]"><span className="truncate">Choose Plan</span></button>
                    </Link>
                  </div>
                </div>
              </div>
              {/* Testimonial Section */}
              <div className="flex flex-col gap-10 px-4 py-10 @container">
                <div className="flex flex-col gap-4 text-center items-center">
                  <h1 className="text-white tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">What Our Users Say</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-4 rounded-lg border border-[#32673f] bg-[#193320] p-6">
                    <p className="text-white/80 italic">"Paypulse has completely changed how I approach side hustles. The referral system is incredibly rewarding, and I started seeing results almost immediately."</p>
                    <div className="flex items-center gap-3 mt-2">
                      <img className="w-12 h-12 rounded-full object-cover" alt="Photo of Sarah L." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhwRwB8qLrCCYtgdjxbj2ENAsorMVZw0_yi1nmpku19WoCJnkYG64Bdh-mTXbFuAARGajMvTeptKJXWhfbU_vgI0M70EZwUiuLXifsr1fI5aWooSy9RioczUjh13ja4g1ueneWNkI_DKMBcZR-Jj0RpMdtBe7xiUpK9WgOYjRlvQ6mZ4sEDYYQPGu0vQ5NYPtVGd5qhmoFz-6_UT4z5ycr0abXs9EQvkRFMSI0sll4oL-mtUC6fpNNcdnVnrOjC5xW9qTDKOzHuApu" />
                      <div>
                        <p className="text-white font-bold">Sarah L.</p>
                        <p className="text-[#92c9a0] text-sm">Content Creator</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 rounded-lg border border-[#32673f] bg-[#193320] p-6">
                    <p className="text-white/80 italic">"As a small business owner, the ad campaign tool is a lifesaver. It's so easy to use and I've reached a whole new customer base without breaking the bank."</p>
                    <div className="flex items-center gap-3 mt-2">
                      <img className="w-12 h-12 rounded-full object-cover" alt="Photo of Mark T." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnKRo6iF_LXXAB13sHH3tpfk8nQ6reRW-dzP4hUfR56pO64JD8DjLgcE1ISvLt3qmOF8t9dEguykt-WLu1JZUoDe3cQZhjun0UqHJOLZzLT8zmXld0roBajyf7ulUDvvU8KZZYuAk4ywLiuYlmmQ8h2lDXVESW6B4YbZXsKT5xvGtUmRGqPIkI6n5oR9TztPtukY8HRbWEVNTMZLTaDi05UaitSGZ0pdNTy9LoHu8u9KSYAhFt3s-58cqfIY4Z67EYUWnQn4aVJVMk" />
                      <div>
                        <p className="text-white font-bold">Mark T.</p>
                        <p className="text-[#92c9a0] text-sm">E-commerce Store Owner</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Footer */}
              <footer className="border-t border-solid border-white/10 dark:border-b-[#23482c] px-4 md:px-10 py-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-2">
                    <p className="text-white/60 text-sm">© 2024 Paypulse. All rights reserved.</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <Link className="text-white/80 text-sm hover:text-primary" href="#">Terms of Service</Link>
                    <Link className="text-white/80 text-sm hover:text-primary" href="#">Privacy Policy</Link>
                  </div>
                </div>
              </footer>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
