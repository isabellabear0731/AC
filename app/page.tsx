import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  Users,
  BookOpen,
} from "lucide-react";

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "#F8F8F3",
      }}
    >
      {/* Navigation */}

      <header className="border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">

          <div>

            <h1 className="text-2xl font-bold text-[#7AAACD]">
              Gifted People Services
            </h1>

          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">

            <a href="#programs" className="hover:text-[#7AAACD]">
              Programs
            </a>

            <a href="#about" className="hover:text-[#7AAACD]">
              About
            </a>

            <a href="#contact" className="hover:text-[#7AAACD]">
              Contact
            </a>

          </nav>

          <Link
            href="/login"
            className="rounded-xl bg-[#7AAACD] px-5 py-2 text-white transition hover:opacity-90"
          >
            Sign In
          </Link>

        </div>
      </header>

      {/* Hero */}

      <section className="mx-auto flex max-w-7xl flex-col items-center px-8 py-24 text-center">

        <span className="rounded-full bg-[#EBEBCF] px-5 py-2 text-sm font-semibold text-gray-700">

          Personalized Education • Family Portal

        </span>

        <h2 className="mt-8 max-w-4xl text-6xl font-bold leading-tight">

          Empowering
          <span className="text-[#7AAACD]">
            {" "}Gifted Learners
          </span>

          <br />

          Through Personalized Education

        </h2>

        <p className="mt-8 max-w-3xl text-xl leading-9 text-gray-600">

          Gifted People Services provides enrichment
          programs, experienced educators, and one
          connected learning platform for students,
          parents, teachers, and administrators.

        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-5">

          <Link
            href="/login"
            className="flex items-center gap-2 rounded-2xl bg-[#7AAACD] px-8 py-4 text-lg font-medium text-white transition hover:opacity-90"
          >
            Sign In

            <ArrowRight className="h-5 w-5" />

          </Link>

          <Link
            href="/signup"
            className="rounded-2xl border bg-white px-8 py-4 text-lg font-medium transition hover:bg-gray-50"
          >
            Create Account
          </Link>

        </div>

      </section>

            {/* Features */}

            <section
        id="programs"
        className="mx-auto max-w-7xl px-8 pb-24"
      >

        <div className="mb-12 text-center">

          <h3 className="text-4xl font-bold">
            Everything Families Need
          </h3>

          <p className="mt-4 text-lg text-gray-500">

            Designed to simplify learning management
            while supporting every student's growth.

          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-3">

          <FeatureCard
            icon={
              <GraduationCap className="h-8 w-8 text-[#7AAACD]" />
            }
            title="Personalized Learning"
            description="Explore enrichment programs tailored to each student's interests, strengths, and learning goals."
          />

          <FeatureCard
            icon={
              <Users className="h-8 w-8 text-[#7AAACD]" />
            }
            title="Family Portal"
            description="Register for courses, view schedules, track attendance, access learning materials, and manage payments in one place."
          />

          <FeatureCard
            icon={
              <BookOpen className="h-8 w-8 text-[#7AAACD]" />
            }
            title="Teacher Collaboration"
            description="Teachers can manage attendance, upload resources, communicate with families, and support student success."
          />

        </div>

      </section>

      {/* Statistics */}

      <section className="bg-white py-20">

        <div className="mx-auto max-w-7xl px-8">

          <div className="grid gap-6 text-center md:grid-cols-4">

            <StatCard
              value="100+"
              label="Students Supported"
            />

            <StatCard
              value="30+"
              label="Enrichment Programs"
            />

            <StatCard
              value="15+"
              label="Experienced Teachers"
            />

            <StatCard
              value="5★"
              label="Family Satisfaction"
            />

          </div>

        </div>

      </section>

      {/* CTA */}

      <section
        id="about"
        className="mx-auto max-w-6xl px-8 py-24"
      >

        <div className="rounded-[32px] bg-[#7AAACD] px-10 py-16 text-center text-white shadow-lg">

          <h2 className="text-4xl font-bold">

            Ready to Begin?

          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg text-blue-50">

            Join our community of students, families,
            and educators. Discover engaging courses,
            personalized learning opportunities, and a
            connected platform that supports every step
            of the learning journey.

          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-5">

            <Link
              href="/signup"
              className="rounded-2xl bg-white px-8 py-4 font-semibold text-[#7AAACD] transition hover:bg-gray-100"
            >
              Create Account
            </Link>

            <Link
              href="/login"
              className="rounded-2xl border border-white px-8 py-4 font-semibold transition hover:bg-white/10"
            >
              Sign In
            </Link>

          </div>

        </div>

      </section>

            {/* Footer */}

            <footer
        id="contact"
        className="border-t bg-white"
      >

        <div className="mx-auto max-w-7xl px-8 py-16">

          <div className="grid gap-10 md:grid-cols-3">

            <div>

              <h3 className="text-2xl font-bold text-[#7AAACD]">
                Gifted People Services
              </h3>

              <p className="mt-4 leading-7 text-gray-600">
                Helping gifted learners discover their
                potential through engaging educational
                programs, experienced educators, and a
                connected learning platform.
              </p>

            </div>

            <div>

              <h4 className="font-semibold">
                Quick Links
              </h4>

              <div className="mt-4 flex flex-col gap-3 text-gray-600">

                <Link
                  href="/login"
                  className="hover:text-[#7AAACD]"
                >
                  Sign In
                </Link>

                <Link
                  href="/signup"
                  className="hover:text-[#7AAACD]"
                >
                  Create Account
                </Link>

              </div>

            </div>

            <div>

              <h4 className="font-semibold">
                Contact
              </h4>

              <div className="mt-4 space-y-2 text-gray-600">

                <p>Email: info@giftedpeople.org</p>

                <p>Phone: (000) 000-0000</p>

                <p>
                  Office Hours:
                  <br />
                  Monday – Friday
                  <br />
                  9:00 AM – 5:00 PM
                </p>

              </div>

            </div>

          </div>

          <div className="mt-12 border-t pt-6 text-center text-sm text-gray-500">

            © {new Date().getFullYear()} Gifted People
            Services. All rights reserved.

          </div>

        </div>

      </footer>

    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7AAACD]/10">

        {icon}

      </div>

      <h3 className="text-2xl font-semibold">
        {title}
      </h3>

      <p className="mt-4 leading-7 text-gray-600">
        {description}
      </p>

    </div>
  );
}

function StatCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-3xl border bg-[#F8F8F3] p-8 shadow-sm">

      <div className="text-5xl font-bold text-[#7AAACD]">

        {value}

      </div>

      <div className="mt-3 text-gray-600">

        {label}

      </div>

    </div>
  );
}
      