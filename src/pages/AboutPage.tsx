import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import GitHub from '@/assets/icons/GitHub';

export const AboutPage: React.FC = () => {
  useDocumentTitle('About');

  const SOCIAL_LINKS = [
    {
      label: 'GitHub',
      description: 'Source code & repository',
      href: 'https://github.com/Rich1997/SuspenseLibrary',
      icon: GitHub,
    },
  ];

  return (
    <div className="space-y-8 pb-12 max-w-xl mx-auto">
      {/* Page Title */}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        About
      </h1>

      {/* Section 1 */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          A fan-made catalog for Sunday Suspense
        </h2>

        <div className="space-y-3.5 text-sm sm:text-base text-muted-foreground leading-relaxed">
          <p>
            Suspense Library is a fan made catalog that aims to collect all episodes of the show
            Sunday Suspense that are uploaded to YouTube.
          </p>

          <p>
            This project was created by a long-time fan in his spare time with a simple goal:{' '}
            <strong className="font-semibold text-foreground">
              to make the extensive collection of Sunday Suspense episodes easier to discover, track,
              search and revisit.
            </strong>
          </p>
        </div>
      </section>

      <hr className="border-border" />

      {/* Section 2: Important Information */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Important information
        </h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Not affiliated with Mirchi
            </h3>
            <div className="space-y-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p>
                This is an{' '}
                <strong className="font-semibold text-foreground">
                  independent, fan-created project
                </strong>{' '}
                and is{' '}
                <strong className="font-semibold text-foreground">
                  not affiliated with, endorsed by, sponsored by, or operated by Mirchi, Mirchi
                  Bangla, or Sunday Suspense
                </strong>
                .
              </p>
              <p>
                The names, trademarks, artwork, characters, stories and other intellectual property
                associated with Sunday Suspense and its respective creators and rights holders
                remain their property. This website does not claim ownership of any of them.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Open source &amp; non-commercial
            </h3>
            <div className="space-y-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p>
                This project is{' '}
                <strong className="font-semibold text-foreground">
                  open source and completely non-commercial
                </strong>
                .
              </p>
              <p>
                There are no advertisements, paid features, sponsorships or other forms of
                monetization. The project is maintained as a personal contribution by a fan who
                simply wanted a better way to explore and keep track of the show&apos;s extensive
                catalog.
              </p>
              <p>
                The project also does not use advertising or tracking technology to build user
                profiles or mine user data.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              We don&apos;t host the episodes
            </h3>
            <div className="space-y-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p>
                <strong className="font-semibold text-foreground">
                  The audio and video content is not hosted on this website.
                </strong>
              </p>
              <p>
                The website only catalogs information about the episodes and provides links to
                the corresponding official content. When you choose to listen to or watch an
                episode, you are taken to the official Mirchi Bangla YouTube channel.
              </p>
              <p>
                No episodes are downloaded, copied, re-uploaded, or redistributed by this website.
              </p>
              <p>
                Similarly, the bookmark and playlist features only save references to the original
                episode links; they do not save copies of the underlying audio or video.
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-border" />

      {/* Section 3: Connect & Source Code */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Connect &amp; Source Code
        </h2>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Suspense Library is open source. Feel free to explore the repository, report bugs, suggest features, or reach out.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {SOCIAL_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/50 hover:bg-accent/60 hover:border-accent-foreground/20 transition-all duration-200 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-background text-foreground transition-colors">
                    <Icon className="size-4.5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {link.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {link.description}
                    </div>
                  </div>
                </div>
                <ExternalLink className="size-4 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            );
          })}
        </div>
      </section>

      <hr className="border-border" />

      {/* Section 4: Other Information */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Other Information
        </h2>

        <div className="space-y-3.5 text-sm sm:text-base text-muted-foreground leading-relaxed">
          <p>
            If you are a rights holder or representative of Mirchi and have any concerns about the
            information, artwork, links or other material displayed here, please get in touch. I
            will be happy to discuss the project and make appropriate changes where necessary.
          </p>

          <p className="pt-2 font-semibold text-foreground">
            Thank you to the incredible team at Radio Mirchi Bangla and to everyone who made
            these stories possible.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
