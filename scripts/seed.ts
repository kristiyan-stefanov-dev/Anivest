/* oxlint-disable unicorn/numeric-separators-style */

import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/models/Schema';
import {
  categories,
  ledgers,
  pledges,
  projectBlocks,
  projectImages,
  projects,
  studios,
  tiers,
} from '../src/models/Schema';
import type { Category } from '../src/models/Schema';

type CategorySlug = Category['slug'];

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:5432/postgres';

const pool = new Pool({ connectionString });
const db = drizzle({ client: pool, schema });

const CATEGORY_NAMES: Record<CategorySlug, string> = {
  popular: 'Popular',
  isekai: 'Isekai',
  drama: 'Drama',
  action: 'Action',
  fantasy: 'Fantasy',
  'slice-of-life': 'Slice of Life',
  mecha: 'Mecha',
  romance: 'Romance',
};

const SEED_STUDIOS = [
  {
    clerkUserId: 'seed_studio_wit-studio',
    name: 'Wit Studio',
    slug: 'wit-studio',
    description:
      'An anime studio behind celebrated productions, seeded from MyAnimeList top popularity rankings.',
    logoUrl: 'https://picsum.photos/seed/wit-studio-logo/200',
    website: 'https://myanimelist.net/anime.php',
  },
  {
    clerkUserId: 'seed_studio_madhouse',
    name: 'Madhouse',
    slug: 'madhouse',
    description:
      'An anime studio behind celebrated productions, seeded from MyAnimeList top popularity rankings.',
    logoUrl: 'https://picsum.photos/seed/madhouse-logo/200',
    website: 'https://myanimelist.net/anime.php',
  },
  {
    clerkUserId: 'seed_studio_bones',
    name: 'Bones',
    slug: 'bones',
    description:
      'An anime studio behind celebrated productions, seeded from MyAnimeList top popularity rankings.',
    logoUrl: 'https://picsum.photos/seed/bones-logo/200',
    website: 'https://myanimelist.net/anime.php',
  },
  {
    clerkUserId: 'seed_studio_ufotable',
    name: 'ufotable',
    slug: 'ufotable',
    description:
      'An anime studio behind celebrated productions, seeded from MyAnimeList top popularity rankings.',
    logoUrl: 'https://picsum.photos/seed/ufotable-logo/200',
    website: 'https://myanimelist.net/anime.php',
  },
  {
    clerkUserId: 'seed_studio_a-1-pictures',
    name: 'A-1 Pictures',
    slug: 'a-1-pictures',
    description:
      'An anime studio behind celebrated productions, seeded from MyAnimeList top popularity rankings.',
    logoUrl: 'https://picsum.photos/seed/a-1-pictures-logo/200',
    website: 'https://myanimelist.net/anime.php',
  },
  {
    clerkUserId: 'seed_studio_studio-pierrot',
    name: 'Studio Pierrot',
    slug: 'studio-pierrot',
    description:
      'An anime studio behind celebrated productions, seeded from MyAnimeList top popularity rankings.',
    logoUrl: 'https://picsum.photos/seed/studio-pierrot-logo/200',
    website: 'https://myanimelist.net/anime.php',
  },
  {
    clerkUserId: 'seed_studio_comix-wave-films',
    name: 'CoMix Wave Films',
    slug: 'comix-wave-films',
    description:
      'An anime studio behind celebrated productions, seeded from MyAnimeList top popularity rankings.',
    logoUrl: 'https://picsum.photos/seed/comix-wave-films-logo/200',
    website: 'https://myanimelist.net/anime.php',
  },
  {
    clerkUserId: 'seed_studio_white-fox',
    name: 'White Fox',
    slug: 'white-fox',
    description:
      'An anime studio behind celebrated productions, seeded from MyAnimeList top popularity rankings.',
    logoUrl: 'https://picsum.photos/seed/white-fox-logo/200',
    website: 'https://myanimelist.net/anime.php',
  },
  {
    clerkUserId: 'seed_studio_toei-animation',
    name: 'Toei Animation',
    slug: 'toei-animation',
    description:
      'An anime studio behind celebrated productions, seeded from MyAnimeList top popularity rankings.',
    logoUrl: 'https://picsum.photos/seed/toei-animation-logo/200',
    website: 'https://myanimelist.net/anime.php',
  },
  {
    clerkUserId: 'seed_studio_kyoto-animation',
    name: 'Kyoto Animation',
    slug: 'kyoto-animation',
    description:
      'An anime studio behind celebrated productions, seeded from MyAnimeList top popularity rankings.',
    logoUrl: 'https://picsum.photos/seed/kyoto-animation-logo/200',
    website: 'https://myanimelist.net/anime.php',
  },
  {
    clerkUserId: 'seed_studio_sunrise',
    name: 'Sunrise',
    slug: 'sunrise',
    description:
      'An anime studio behind celebrated productions, seeded from MyAnimeList top popularity rankings.',
    logoUrl: 'https://picsum.photos/seed/sunrise-logo/200',
    website: 'https://myanimelist.net/anime.php',
  },
  {
    clerkUserId: 'seed_studio_jc-staff',
    name: 'J.C.Staff',
    slug: 'jc-staff',
    description:
      'An anime studio behind celebrated productions, seeded from MyAnimeList top popularity rankings.',
    logoUrl: 'https://picsum.photos/seed/jc-staff-logo/200',
    website: 'https://myanimelist.net/anime.php',
  },
  {
    clerkUserId: 'seed_studio_mappa',
    name: 'MAPPA',
    slug: 'mappa',
    description:
      'An anime studio behind celebrated productions, seeded from MyAnimeList top popularity rankings.',
    logoUrl: 'https://picsum.photos/seed/mappa-logo/200',
    website: 'https://myanimelist.net/anime.php',
  },
];

type MalAnime = {
  studioSlug: string;
  slug: string;
  title: string;
  category: CategorySlug;
  members: number;
  image: string;
  synopsis: string;
};

// Top 30 most popular anime on MyAnimeList (https://myanimelist.net/topanime.php?type=bypopularity).
const MAL_TOP_ANIME: MalAnime[] = [
  {
    studioSlug: 'wit-studio',
    slug: 'attack-on-titan',
    title: 'Attack on Titan',
    category: 'action',
    members: 4397313,
    image: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
    synopsis: `Centuries ago, mankind was slaughtered to near extinction by monstrous humanoid creatures called Titans, forcing humans to hide in fear behind enormous concentric walls. What makes these giants truly terrifying is that their taste for human flesh is not born out of hunger but what appears to be out of pleasure. To ensure their survival, the remnants of humanity began living within defensive barriers, resulting in one hundred years without a single titan encounter. However, that fragile calm is soon shattered when a colossal Titan manages to breach the supposedly impregnable outer wall, reigniting the fight for survival against the man-eating abominations. After witnessing a horrific personal loss at the hands of the invading creatures, Eren Yeager dedicates his life to their eradication by enlisting into the Survey Corps, an elite military unit that combats the merciless humanoids outside the protection of the walls. Eren, his adopted sister Mikasa Ackerman, and his childhood friend Armin Arlert join the brutal war against the Titans and race to discover a way of defeating them before the last walls are breached.`,
  },
  {
    studioSlug: 'madhouse',
    slug: 'death-note',
    title: 'Death Note',
    category: 'drama',
    members: 4334887,
    image: 'https://cdn.myanimelist.net/images/anime/1079/138100.jpg',
    synopsis: `Brutal murders, petty thefts, and senseless violence pollute the human world. In contrast, the realm of death gods is a humdrum, unchanging gambling den. The ingenious 17-year-old Japanese student Light Yagami and sadistic god of death Ryuk share one belief: their worlds are rotten. For his own amusement, Ryuk drops his Death Note into the human world. Light stumbles upon it, deeming the first of its rules ridiculous: the human whose name is written in this note shall die. However, the temptation is too great, and Light experiments by writing a felon's name, which disturbingly enacts his first murder. Aware of the terrifying godlike power that has fallen into his hands, Light—under the alias Kira—follows his wicked sense of justice with the ultimate goal of cleansing the world of all evil-doers. The meticulous mastermind detective L is already on his trail, but as Light's brilliance rivals L's, the grand chase for Kira turns into an intense battle of wits that can only end when one of them is dead.`,
  },
  {
    studioSlug: 'bones',
    slug: 'fullmetal-alchemist-brotherhood',
    title: 'Fullmetal Alchemist: Brotherhood',
    category: 'fantasy',
    members: 3711926,
    image: 'https://cdn.myanimelist.net/images/anime/1208/94745.jpg',
    synopsis: `After a horrific alchemy experiment goes wrong in the Elric household, brothers Edward and Alphonse are left in a catastrophic new reality. Ignoring the alchemical principle banning human transmutation, the boys attempted to bring their recently deceased mother back to life. Instead, they suffered brutal personal loss: Alphonse's body disintegrated while Edward lost a leg and then sacrificed an arm to keep Alphonse's soul in the physical realm by binding it to a hulking suit of armor. The brothers are rescued by their neighbor Pinako Rockbell and her granddaughter Winry. Known as a bio-mechanical engineering prodigy, Winry creates prosthetic limbs for Edward by utilizing "automail," a tough, versatile metal used in robots and combat armor. After years of training, the Elric brothers set off on a quest to restore their bodies by locating the Philosopher's Stone—a powerful gem that allows an alchemist to defy the traditional laws of Equivalent Exchange. As Edward becomes an infamous alchemist and gains the nickname "Fullmetal," the boys' journey embroils them in a growing conspiracy that threatens the fate of the world.`,
  },
  {
    studioSlug: 'madhouse',
    slug: 'one-punch-man',
    title: 'One Punch Man',
    category: 'action',
    members: 3542027,
    image: 'https://cdn.myanimelist.net/images/anime/12/76049.jpg',
    synopsis: `The seemingly unimpressive Saitama has a rather unique hobby: being a hero. In order to pursue his childhood dream, Saitama relentlessly trained for three years, losing all of his hair in the process. Now, Saitama is so powerful, he can defeat any enemy with just one punch. However, having no one capable of matching his strength has led Saitama to an unexpected problem—he is no longer able to enjoy the thrill of battling and has become quite bored. One day, Saitama catches the attention of 19-year-old cyborg Genos, who witnesses his power and wishes to become Saitama's disciple. Genos proposes that the two join the Hero Association in order to become certified heroes that will be recognized for their positive contributions to society. Saitama, who is shocked that no one knows who he is, quickly agrees. Meeting new allies and taking on new foes, Saitama embarks on a new journey as a member of the Hero Association to experience the excitement of battle he once felt.`,
  },
  {
    studioSlug: 'ufotable',
    slug: 'demon-slayer',
    title: 'Demon Slayer',
    category: 'action',
    members: 3481199,
    image: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
    synopsis: `Ever since the death of his father, the burden of supporting the family has fallen upon Tanjirou Kamado's shoulders. Though living impoverished on a remote mountain, the Kamado family are able to enjoy a relatively peaceful and happy life. One day, Tanjirou decides to go down to the local village to make a little money selling charcoal. On his way back, night falls, forcing Tanjirou to take shelter in the house of a strange man, who warns him of the existence of flesh-eating demons that lurk in the woods at night. When he finally arrives back home the next day, he is met with a horrifying sight—his whole family has been slaughtered. Worse still, the sole survivor is his sister Nezuko, who has been turned into a bloodthirsty demon. Consumed by rage and hatred, Tanjirou swears to avenge his family and stay by his only remaining sibling. Alongside the mysterious group calling themselves the Demon Slayer Corps, Tanjirou will do whatever it takes to slay the demons and protect the remnants of his beloved sister's humanity.`,
  },
  {
    studioSlug: 'bones',
    slug: 'my-hero-academia',
    title: 'My Hero Academia',
    category: 'action',
    members: 3331018,
    image: 'https://cdn.myanimelist.net/images/anime/10/78745.jpg',
    synopsis: `The appearance of "quirks," newly discovered super powers, has been steadily increasing over the years, with 80 percent of humanity possessing various abilities from manipulation of elements to shapeshifting. This leaves the remainder of the world completely powerless, and Izuku Midoriya is one such individual. Since he was a child, the ambitious middle schooler has wanted nothing more than to be a hero. Izuku's unfair fate leaves him admiring heroes and taking notes on them whenever he can. But it seems that his persistence has borne some fruit: Izuku meets the number one hero and his personal idol, All Might. All Might's quirk is a unique ability that can be inherited, and he has chosen Izuku to be his successor! Enduring many months of grueling training, Izuku enrolls in UA High, a prestigious high school famous for its excellent hero training program, and this year's freshmen look especially promising. With his bizarre but talented classmates and the looming threat of a villainous organization, Izuku will soon learn what it really means to be a hero.`,
  },
  {
    studioSlug: 'a-1-pictures',
    slug: 'sword-art-online',
    title: 'Sword Art Online',
    category: 'fantasy',
    members: 3319350,
    image: 'https://cdn.myanimelist.net/images/anime/11/39717.jpg',
    synopsis: `Ever since the release of the innovative NerveGear, gamers from all around the globe have been given the opportunity to experience a completely immersive virtual reality. Sword Art Online (SAO), one of the most recent games on the console, offers a gateway into the wondrous world of Aincrad, a vivid, medieval landscape where users can do anything within the limits of imagination. With the release of this worldwide sensation, gaming has never felt more lifelike. However, the idyllic fantasy rapidly becomes a brutal nightmare when SAO's creator traps thousands of players inside the game. The "log-out" function has been removed, with the only method of escape involving beating all of Aincrad's one hundred increasingly difficult levels. Adding to the struggle, any in-game death becomes permanent, ending the player's life in the real world. While Kazuto "Kirito" Kirigaya was fortunate enough to be a beta-tester for the game, he quickly finds that despite his advantages, he cannot overcome SAO's challenges alone. Teaming up with Asuna Yuuki and other talented players, Kirito makes an effort to face the seemingly insurmountable trials head-on. But with difficult bosses and threatening dark cults impeding his progress, Kirito finds that such tasks are much easier said than done.`,
  },
  {
    studioSlug: 'madhouse',
    slug: 'hunter-x-hunter',
    title: 'Hunter x Hunter',
    category: 'fantasy',
    members: 3217515,
    image: 'https://cdn.myanimelist.net/images/anime/1337/99013.jpg',
    synopsis: `Hunters devote themselves to accomplishing hazardous tasks, all from traversing the world's uncharted territories to locating rare items and monsters. Before becoming a Hunter, one must pass the Hunter Examination—a high-risk selection process in which most applicants end up handicapped or worse, deceased. Ambitious participants who challenge the notorious exam carry their own reason. What drives 12-year-old Gon Freecss is finding Ging, his father and a Hunter himself. Believing that he will meet his father by becoming a Hunter, Gon takes the first step to walk the same path. During the Hunter Examination, Gon befriends the medical student Leorio Paladiknight, the vindictive Kurapika, and ex-assassin Killua Zoldyck. While their motives vastly differ from each other, they band together for a common goal and begin to venture into a perilous world.`,
  },
  {
    studioSlug: 'studio-pierrot',
    slug: 'naruto',
    title: 'Naruto',
    category: 'action',
    members: 3140166,
    image: 'https://cdn.myanimelist.net/images/anime/1141/142503.jpg',
    synopsis: `Twelve years ago, a colossal demon fox terrorized the world. During the monster's attack on the Hidden Leaf Village, the Hokage—the village's leader and most powerful ninja—sacrifices himself to seal the beast inside a newborn, relieving civilization from destruction while dooming the baby to a lonely life. Now, after years of being shunned and bullied, Naruto Uzumaki pesters the village with elaborate pranks and vandalism. Despite these antics, he works hard to achieve his dream: to become the Hokage and earn the acknowledgement of those who have mistreated him for his entire life. Naruto joins Team 7, a ninja squad made up of two of his peers—prodigy Sasuke Uchiha and clever Sakura Haruno. Under the aloof Kakashi Hatake's leadership, Team 7 takes on a series of difficult missions, forcing its members to grow in strength and comradery despite their many differences. Naruto strives to stand out in his rivalry with Sasuke and earn the romantic affection of Sakura. But as the trio brush against danger and death, their tragic pasts threaten to tear them apart.`,
  },
  {
    studioSlug: 'mappa',
    slug: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    category: 'action',
    members: 3077239,
    image: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg',
    synopsis: `Idly indulging in baseless paranormal activities with the Occult Club, high schooler Yuuji Itadori spends his days at either the clubroom or the hospital, where he visits his bedridden grandfather. However, this leisurely lifestyle soon takes a turn for the strange when he unknowingly encounters a cursed item. Triggering a chain of supernatural occurrences, Yuuji finds himself suddenly thrust into the world of Curses—dreadful beings formed from human malice and negativity—after swallowing the said item, revealed to be a finger belonging to the demon Sukuna Ryoumen, the King of Curses. Yuuji experiences first-hand the threat these Curses pose to society as he discovers his own newfound powers. Introduced to the Tokyo Prefectural Jujutsu High School, he begins to walk down a path from which he cannot return—the path of a Jujutsu sorcerer.`,
  },
  {
    studioSlug: 'studio-pierrot',
    slug: 'tokyo-ghoul',
    title: 'Tokyo Ghoul',
    category: 'drama',
    members: 3076451,
    image: 'https://cdn.myanimelist.net/images/anime/1498/134443.jpg',
    synopsis: `A sinister threat is invading Tokyo: flesh-eating "ghouls" who appear identical to humans and blend into their population. Reserved college student Ken Kaneki buries his nose in books and avoids the news of the growing crisis. However, the appearance of an attractive woman named Rize Kamishiro shatters his solitude when she forwardly asks him on a date. While walking Rize home, Kaneki discovers she isn't as kind as she first appeared, and she has led him on with sinister intent. After a tragic struggle, he later awakens in a hospital to learn his life was saved by transplanting the now deceased Rize's organs into his own body. Kaneki's body begins to change in horrifying ways, and he transforms into a human-ghoul hybrid. As he embarks on his new dreadful journey, Kaneki clings to his humanity in the evolving bloody conflict between society's new monsters and the government agents who hunt them.`,
  },
  {
    studioSlug: 'comix-wave-films',
    slug: 'your-name',
    title: 'Your Name.',
    category: 'romance',
    members: 3050189,
    image: 'https://cdn.myanimelist.net/images/anime/5/87048.jpg',
    synopsis: `Mitsuha Miyamizu, a high school girl, yearns to live the life of a boy in the bustling city of Tokyo—a dream that stands in stark contrast to her present life in the countryside. Meanwhile in the city, Taki Tachibana lives a busy life as a high school student while juggling his part-time job and hopes for a future in architecture. One day, Mitsuha awakens in a room that is not her own and suddenly finds herself living the dream life in Tokyo—but in Taki's body! Elsewhere, Taki finds himself living Mitsuha's life in the humble countryside. In pursuit of an answer to this strange phenomenon, they begin to search for one another. Kimi no Na wa. revolves around Mitsuha and Taki's actions, which begin to have a dramatic impact on each other's lives, weaving them into a fabric held together by fate and circumstance.`,
  },
  {
    studioSlug: 'wit-studio',
    slug: 'attack-on-titan-season-2',
    title: 'Attack on Titan Season 2',
    category: 'action',
    members: 3045528,
    image: 'https://cdn.myanimelist.net/images/anime/4/84177.jpg',
    synopsis: `For centuries, humanity has been hunted by giant, mysterious predators known as the Titans. Three mighty walls—Wall Maria, Rose, and Sheena—provided peace and protection for humanity for over a hundred years. That peace, however, was shattered when the Colossal Titan and Armored Titan appeared and destroyed the outermost wall, Wall Maria. Forced to retreat behind Wall Rose, humanity waited with bated breath for the Titans to reappear and destroy their safe haven once more. In Shingeki no Kyojin Season 2, Eren Yeager and others of the 104th Training Corps have just begun to become full members of the Survey Corps. As they ready themselves to face the Titans once again, their preparations are interrupted by the invasion of Wall Rose—but all is not as it seems as more mysteries are unraveled. As the Survey Corps races to save the wall, they uncover more about the invading Titans and the dark secrets of their own members.`,
  },
  {
    studioSlug: 'white-fox',
    slug: 'steins-gate',
    title: 'Steins;Gate',
    category: 'drama',
    members: 2834190,
    image: 'https://cdn.myanimelist.net/images/anime/1935/127974.jpg',
    synopsis: `Eccentric scientist Rintarou Okabe has a never-ending thirst for scientific exploration. Together with his ditzy but well-meaning friend Mayuri Shiina and his roommate Itaru Hashida, Okabe founds the Future Gadget Laboratory in the hopes of creating technological innovations that baffle the human psyche. Despite claims of grandeur, the only notable "gadget" the trio have created is a microwave that has the mystifying power to turn bananas into green goo. However, when Okabe attends a conference on time travel, he experiences a series of strange events that lead him to believe that there is more to the "Phone Microwave" gadget than meets the eye. Apparently able to send text messages into the past using the microwave, Okabe dabbles further with the "time machine," attracting the ire and attention of the mysterious organization SERN. Due to the novel discovery, Okabe and his friends find themselves in an ever-present danger. As he works to mitigate the damage his invention has caused to the timeline, Okabe fights a battle to not only save his loved ones but also to preserve his degrading sanity.`,
  },
  {
    studioSlug: 'studio-pierrot',
    slug: 'naruto-shippuden',
    title: 'Naruto: Shippuden',
    category: 'action',
    members: 2770065,
    image: 'https://cdn.myanimelist.net/images/anime/1565/111305.jpg',
    synopsis: `It has been two and a half years since Naruto Uzumaki left Konohagakure, the Hidden Leaf Village, for intense training following events which fueled his desire to be stronger. Now Akatsuki, the mysterious organization of elite rogue ninja, is closing in on their grand plan which may threaten the safety of the entire shinobi world. Although Naruto is older and sinister events loom on the horizon, he has changed little in personality—still rambunctious and childish—though he is now far more confident and possesses an even greater determination to protect his friends and home. Come whatever may, Naruto will carry on with the fight for what is important to him, even at the expense of his own body, in the continuation of the saga about the boy who wishes to become Hokage.`,
  },
  {
    studioSlug: 'bones',
    slug: 'my-hero-academia-2nd-season',
    title: 'My Hero Academia 2nd Season',
    category: 'action',
    members: 2751896,
    image: 'https://cdn.myanimelist.net/images/anime/12/85221.jpg',
    synopsis: `At UA Academy, not even a violent attack can disrupt their most prestigious event: the school sports festival. Renowned across Japan, this festival is an opportunity for aspiring heroes to showcase their abilities, both to the public and potential recruiters. However, the path to glory is never easy, especially for Izuku Midoriya—whose quirk possesses great raw power but is also cripplingly inefficient. Pitted against his talented classmates, such as the fire and ice wielding Shouto Todoroki, Izuku must utilize his sharp wits and master his surroundings to achieve victory and prove to the world his worth.`,
  },
  {
    studioSlug: 'toei-animation',
    slug: 'one-piece',
    title: 'One Piece',
    category: 'fantasy',
    members: 2706899,
    image: 'https://cdn.myanimelist.net/images/anime/1244/138851.jpg',
    synopsis: `Barely surviving in a barrel after passing through a terrible whirlpool at sea, carefree Monkey D. Luffy ends up aboard a ship under attack by fearsome pirates. Despite being a naive-looking teenager, he is not to be underestimated. Unmatched in battle, Luffy is a pirate himself who resolutely pursues the coveted One Piece treasure and the King of the Pirates title that comes with it. The late King of the Pirates, Gol D. Roger, stirred up the world before his death by disclosing the whereabouts of his hoard of riches and daring everyone to obtain it. Ever since then, countless powerful pirates have sailed dangerous seas for the prized One Piece only to never return. Although Luffy lacks a crew and a proper ship, he is endowed with a superhuman ability and an unbreakable spirit that make him not only a formidable adversary but also an inspiration to many. As he faces numerous challenges with a big smile on his face, Luffy gathers one-of-a-kind companions to join him in his ambitious endeavor, together embracing perils and wonders on their once-in-a-lifetime adventure.`,
  },
  {
    studioSlug: 'wit-studio',
    slug: 'attack-on-titan-season-3',
    title: 'Attack on Titan Season 3',
    category: 'action',
    members: 2691473,
    image: 'https://cdn.myanimelist.net/images/anime/1173/92110.jpg',
    synopsis: `Still threatened by the "Titans" that rob them of their freedom, mankind remains caged inside the two remaining walls. Efforts to eradicate these monsters continue; however, threats arise not only from the Titans beyond the walls, but from the humans within them as well. After being rescued from the Colossal and Armored Titans, Eren Yaeger devotes himself to improving his Titan form. Krista Lenz struggles to accept the loss of her friend, Captain Levi chooses Eren and his friends to form his new personal squad, and Commander Erwin Smith recovers from his injuries. All seems well for the soldiers, until the government suddenly demands custody of Eren and Krista. The Survey Corps' recent successes have drawn attention, and a familiar face from Levi's past is sent to collect the wanted soldiers. Sought after by the government, Levi and his new squad must evade their adversaries in hopes of keeping Eren and Krista safe. Eren and his fellow soldiers are not only fighting for their survival against the terrifying Titans, but also against the terror of a far more conniving foe: their fellow humans.`,
  },
  {
    studioSlug: 'kyoto-animation',
    slug: 'a-silent-voice',
    title: 'A Silent Voice',
    category: 'drama',
    members: 2641235,
    image: 'https://cdn.myanimelist.net/images/anime/1122/96435.jpg',
    synopsis: `As a wild youth, elementary school student Shouya Ishida sought to beat boredom in the cruelest ways. When the deaf Shouko Nishimiya transfers into his class, Shouya and the rest of his class thoughtlessly bully her for fun. However, when her mother notifies the school, he is singled out and blamed for everything done to her. With Shouko transferring out of the school, Shouya is left at the mercy of his classmates. He is heartlessly ostracized all throughout elementary and middle school, while teachers turn a blind eye. Now in his third year of high school, Shouya is still plagued by his wrongdoings as a young boy. Sincerely regretting his past actions, he sets out on a journey of redemption: to meet Shouko once more and make amends. Koe no Katachi tells the heartwarming tale of Shouya's reunion with Shouko and his honest attempts to redeem himself, all while being continually haunted by the shadows of his past.`,
  },
  {
    studioSlug: 'wit-studio',
    slug: 'attack-on-titan-season-3-part-2',
    title: 'Attack on Titan Season 3 Part 2',
    category: 'action',
    members: 2619075,
    image: 'https://cdn.myanimelist.net/images/anime/1517/100633.jpg',
    synopsis: `Seeking to restore humanity's diminishing hope, the Survey Corps embark on a mission to retake Wall Maria, where the battle against the merciless "Titans" takes the stage once again. Returning to the tattered Shiganshina District that was once his home, Eren Yeager and the Corps find the town oddly unoccupied by Titans. Even after the outer gate is plugged, they strangely encounter no opposition. The mission progresses smoothly until Armin Arlert, highly suspicious of the enemy's absence, discovers distressing signs of a potential scheme against them. Shingeki no Kyojin Season 3 Part 2 follows Eren as he vows to take back everything that was once his. Alongside him, the Survey Corps strive—through countless sacrifices—to carve a path towards victory and uncover the secrets locked away in the Yeager family's basement.`,
  },
  {
    studioSlug: 'madhouse',
    slug: 'no-game-no-life',
    title: 'No Game No Life',
    category: 'isekai',
    members: 2571465,
    image: 'https://cdn.myanimelist.net/images/anime/1074/111944.jpg',
    synopsis: `Sixteen sentient races inhabit Disboard, a world overseen by Tet, the One True God. The lowest of the sixteen—Imanity—consists of humans, a race with no affinity for magic. In a place where everything is decided through simple games, humankind seems to have no way out of their predicament—but the arrival of two outsiders poses a change. On Earth, stepsiblings Sora and Shiro are two inseparable shut-ins who dominate various online games under the username "Blank." While notorious on the internet, the pair believe that life is merely another dull game. However, after responding to a message from an unknown user, they are suddenly transported to Disboard. The mysterious sender turns out to be Tet, who informs them about the world's absolute rules. After Tet leaves, Sora and Shiro begin their search for more information and a place to stay, taking them to Elkia—Imanity's only remaining kingdom. There, the duo encounters Stephanie Dola, an emotional girl vying for the kingdom's sovereignty. In desperation, she attempts to regain her father's throne, but her foolhardiness makes her goal unachievable. Inspired by the girl's motivation and passion, Sora and Shiro decide to aid Stephanie in getting Elkia back on its feet, ultimately aiming to become the new rulers of the enigmatic realm.`,
  },
  {
    studioSlug: 'sunrise',
    slug: 'code-geass',
    title: 'Code Geass: Lelouch of the Rebellion',
    category: 'mecha',
    members: 2492606,
    image: 'https://cdn.myanimelist.net/images/anime/1032/135088.jpg',
    synopsis: `In the year 2010, the Holy Empire of Britannia is establishing itself as a dominant military nation, starting with the conquest of Japan. Renamed to Area 11 after its swift defeat, Japan has seen significant resistance against these tyrants in an attempt to regain independence. Lelouch Lamperouge, a Britannian student, unfortunately finds himself caught in a crossfire between the Britannian and the Area 11 rebel armed forces. He is able to escape, however, thanks to the timely appearance of a mysterious girl named C.C., who bestows upon him Geass, the "Power of Kings." Realizing the vast potential of his newfound "power of absolute obedience," Lelouch embarks upon a perilous journey as the masked vigilante known as Zero, leading a merciless onslaught against Britannia in order to get revenge once and for all.`,
  },
  {
    studioSlug: 'white-fox',
    slug: 're-zero',
    title: 'Re:Zero kara Hajimeru Isekai Seikatsu',
    category: 'isekai',
    members: 2488190,
    image: 'https://cdn.myanimelist.net/images/anime/1522/128039.jpg',
    synopsis: `When Subaru Natsuki leaves the convenience store, the last thing he expects is to be wrenched from his everyday life and dropped into a fantasy world. Things are not looking good for the bewildered teenager; however, not long after his arrival, he is attacked by some thugs. Armed with only a bag of groceries and a now useless cell phone, he is quickly beaten to a pulp. Fortunately, a mysterious beauty named Satella, in hot pursuit after the one who stole her insignia, happens upon Subaru and saves him. In order to thank the honest and kindhearted girl, Subaru offers to help in her search, and later that night, he even finds the whereabouts of that which she seeks. But unbeknownst to them, a much darker force stalks the pair from the shadows, and just minutes after locating the insignia, Subaru and Satella are brutally murdered. However, Subaru immediately reawakens to a familiar scene—confronted by the same group of thugs, meeting Satella all over again—the enigma deepens as history inexplicably repeats itself.`,
  },
  {
    studioSlug: 'a-1-pictures',
    slug: 'your-lie-in-april',
    title: 'Your Lie in April',
    category: 'romance',
    members: 2444571,
    image: 'https://cdn.myanimelist.net/images/anime/1405/143284.jpg',
    synopsis: `Kousei Arima is a child prodigy known as the "Human Metronome" for playing the piano with precision and perfection. Guided by a strict mother and rigorous training, Kousei dominates every competition he enters, earning the admiration of his musical peers and praise from audiences. When his mother suddenly passes away, the subsequent trauma makes him unable to hear the sound of a piano, and he never takes the stage thereafter. Nowadays, Kousei lives a quiet and unassuming life as a junior high school student alongside his friends Tsubaki Sawabe and Ryouta Watari. While struggling to get over his mother's death, he continues to cling to music. His monochrome life turns upside down the day he encounters the eccentric violinist Kaori Miyazono, who thrusts him back into the spotlight as her accompanist. Through a little lie, these two young musicians grow closer together as Kaori tries to fill Kousei's world with color.`,
  },
  {
    studioSlug: 'bones',
    slug: 'my-hero-academia-3rd-season',
    title: 'My Hero Academia 3rd Season',
    category: 'action',
    members: 2399943,
    image: 'https://cdn.myanimelist.net/images/anime/1319/92084.jpg',
    synopsis: `As summer arrives for the students at UA Academy, each of these superheroes-in-training puts in their best efforts to become renowned heroes. They head off to a forest training camp run by UA's pro heroes, where the students face one another in battle and go through dangerous tests, improving their abilities and pushing past their limits. However, their school trip is suddenly turned upside down when the League of Villains arrives, invading the camp with a mission to capture one of the students. Boku no Hero Academia 3rd Season follows Izuku "Deku" Midoriya, an ambitious student training to achieve his dream of becoming a hero similar to his role model—All Might. Being one of the students caught up amidst the chaos of the villain attack, Deku must take a stand with his classmates and fight for their survival.`,
  },
  {
    studioSlug: 'jc-staff',
    slug: 'toradora',
    title: 'Toradora!',
    category: 'romance',
    members: 2381073,
    image: 'https://cdn.myanimelist.net/images/anime/13/22128.jpg',
    synopsis: `Ryuuji Takasu is a gentle high school student with a love for housework; but in contrast to his kind nature, he has an intimidating face that often gets him labeled as a delinquent. On the other hand is Taiga Aisaka, a small, doll-like student, who is anything but a cute and fragile girl. Equipped with a wooden katana and feisty personality, Taiga is known throughout the school as the "Palmtop Tiger." One day, an embarrassing mistake causes the two students to cross paths. Ryuuji discovers that Taiga actually has a sweet side: she has a crush on the popular vice president, Yuusaku Kitamura, who happens to be his best friend. But things only get crazier when Ryuuji reveals that he has a crush on Minori Kushieda—Taiga's best friend! Toradora! is a romantic comedy that follows this odd duo as they embark on a quest to help each other with their respective crushes, forming an unlikely alliance in the process.`,
  },
  {
    studioSlug: 'bones',
    slug: 'mob-psycho-100',
    title: 'Mob Psycho 100',
    category: 'action',
    members: 2341372,
    image: 'https://cdn.myanimelist.net/images/anime/8/80356.jpg',
    synopsis: `Eighth-grader Shigeo "Mob" Kageyama has tapped into his inner wellspring of psychic prowess at a young age. But the power quickly proves to be a liability when he realizes the potential danger in his skills. Choosing to suppress his power, Mob's only present use for his ability is to impress his longtime crush, Tsubomi, who soon grows bored of the same tricks. In order to effectuate control on his skills, Mob enlists himself under the wing of Arataka Reigen, a con artist claiming to be a psychic, who exploits Mob's powers for pocket change. Now, exorcising evil spirits on command has become a part of Mob's daily, monotonous life. However, the psychic energy he exerts is barely the tip of the iceberg; if his vast potential and unrestrained emotions run berserk, a cataclysmic event that would render him completely unrecognizable will be triggered. The progression toward Mob's explosion is rising and attempting to stop it is futile.`,
  },
  {
    studioSlug: 'bones',
    slug: 'noragami',
    title: 'Noragami',
    category: 'fantasy',
    members: 2328619,
    image: 'https://cdn.myanimelist.net/images/anime/1886/128266.jpg',
    synopsis: `In times of need, if you look in the right place, you just may see a strange telephone number scrawled in red. If you call this number, you will hear a young man introduce himself as the Yato God. Yato is a minor deity and a self-proclaimed "Delivery God," who dreams of having millions of worshippers. Without a single shrine dedicated to his name, however, his goals are far from being realized. He spends his days doing odd jobs for five yen apiece, until his weapon partner becomes fed up with her useless master and deserts him. Just as things seem to be looking grim for the god, his fortune changes when a middle school girl, Hiyori Iki, supposedly saves Yato from a car accident, taking the hit for him. Remarkably, she survives, but the event has caused her soul to become loose and hence able to leave her body. Hiyori demands that Yato return her to normal, but upon learning that he needs a new partner to do so, reluctantly agrees to help him find one. And with Hiyori's help, Yato's luck may finally be turning around.`,
  },
  {
    studioSlug: 'mappa',
    slug: 'attack-on-titan-the-final-season',
    title: 'Attack on Titan: The Final Season',
    category: 'action',
    members: 2314179,
    image: 'https://cdn.myanimelist.net/images/anime/1000/110531.jpg',
    synopsis: `Gabi Braun and Falco Grice have been training their entire lives to inherit one of the seven Titans under Marley's control and aid their nation in eradicating the Eldians on Paradis. However, just as all seems well for the two cadets, their peace is suddenly shaken by the arrival of Eren Yeager and the remaining members of the Survey Corps. Having finally reached the Yeager family basement and learned about the dark history surrounding the Titans, the Survey Corps has at long last found the answer they so desperately fought to uncover. With the truth now in their hands, the group set out for the world beyond the walls. In Shingeki no Kyojin: The Final Season, two utterly different worlds collide as each party pursues its own agenda in the long-awaited conclusion to Paradis' fight for freedom.`,
  },
  {
    studioSlug: 'a-1-pictures',
    slug: 'erased',
    title: 'Erased',
    category: 'drama',
    members: 2309993,
    image: 'https://cdn.myanimelist.net/images/anime/10/77957.jpg',
    synopsis: `When tragedy is about to strike, Satoru Fujinuma finds himself sent back several minutes before the accident occurs. The detached, 29-year-old manga artist has taken advantage of this powerful yet mysterious phenomenon, which he calls "Revival," to save many lives. However, when he is wrongfully accused of murdering someone close to him, Satoru is sent back to the past once again, but this time to 1988, 18 years in the past. Soon, he realizes that the murder may be connected to the abduction and killing of one of his classmates, the solitary and mysterious Kayo Hinazuki, that took place when he was a child. This is his chance to make things right. Boku dake ga Inai Machi follows Satoru in his mission to uncover what truly transpired 18 years ago and prevent the death of his classmate while protecting those he cares about in the present.`,
  },
];

type SeedProject = {
  studioSlug: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  coverImageUrl: string;
  galleryImages: string[];
  category: CategorySlug;
  goalAmount: number;
  status: string;
  featured: boolean;
  endsAtDays: number | null;
  tiers: {
    title: string;
    description: string;
    price: number;
    limitedQuantity: number | null;
    reward: string;
    displayOrder: number;
  }[];
  ledgers: { label: string; amount: number; note: string; displayOrder: number }[];
  blocks: { type: string; content: Record<string, unknown>; displayOrder: number }[];
};

function deriveTagline(synopsis: string): string {
  const firstSentence = synopsis.split(/(?<=\.)\s/u)[0] ?? synopsis;
  return firstSentence.length > 160 ? `${firstSentence.slice(0, 157)}...` : firstSentence;
}

function buildProject(mal: MalAnime): SeedProject {
  const goalAmount = Math.max(5_000, Math.round(mal.members / 100));
  const collectorPrice = 50 + Math.round(mal.members / 200_000) * 10;
  const animationAmount = Math.round(goalAmount * 0.5);
  const musicAmount = Math.round(goalAmount * 0.3);
  const distributionAmount = goalAmount - animationAmount - musicAmount;
  return {
    studioSlug: mal.studioSlug,
    slug: mal.slug,
    title: mal.title,
    tagline: deriveTagline(mal.synopsis),
    description: mal.synopsis,
    coverImageUrl: mal.image,
    galleryImages: [
      `https://picsum.photos/seed/${mal.slug}-1/1920/1080`,
      `https://picsum.photos/seed/${mal.slug}-2/1920/1080`,
      `https://picsum.photos/seed/${mal.slug}-3/1920/1080`,
      `https://picsum.photos/seed/${mal.slug}-4/1920/1080`,
    ],
    category: mal.category,
    goalAmount,
    status: 'live',
    featured: mal.members > 3_000_000,
    endsAtDays: 20 + (mal.members % 40),
    tiers: [
      {
        title: 'Digital Supporter',
        description: 'Name in credits and a digital art booklet.',
        price: 15,
        limitedQuantity: null,
        reward: 'Digital art booklet + credits',
        displayOrder: 0,
      },
      {
        title: `Collector's Edition`,
        description: 'A signed art print from the animation studio.',
        price: collectorPrice,
        limitedQuantity: 500,
        reward: 'Signed art print',
        displayOrder: 1,
      },
      {
        title: 'Executive Producer',
        description: 'Your name in the end credits as an EP.',
        price: 1_000,
        limitedQuantity: 20,
        reward: 'Executive producer credit',
        displayOrder: 2,
      },
    ],
    ledgers: [
      {
        label: 'Animation production',
        amount: animationAmount,
        note: 'Key frames and in-betweening.',
        displayOrder: 0,
      },
      {
        label: 'Music and sound',
        amount: musicAmount,
        note: 'Original score and voice cast.',
        displayOrder: 1,
      },
      {
        label: 'Distribution',
        amount: distributionAmount,
        note: 'Festival and streaming release.',
        displayOrder: 2,
      },
    ],
    blocks: [
      { type: 'text', content: { heading: 'Synopsis', body: mal.synopsis }, displayOrder: 0 },
    ],
  };
}

const SEED_PROJECTS: SeedProject[] = MAL_TOP_ANIME.map(buildProject);

const seed = async () => {
  console.log('Seeding categories...');
  const categorySlugs: CategorySlug[] = [
    'popular',
    'isekai',
    'drama',
    'action',
    'fantasy',
    'slice-of-life',
    'mecha',
    'romance',
  ];
  await db
    .insert(categories)
    .values(
      categorySlugs.map((slug, index) => ({
        slug,
        name: CATEGORY_NAMES[slug],
        displayOrder: index,
      })),
    )
    .onConflictDoUpdate({
      target: categories.slug,
      set: { name: sql`excluded.name`, displayOrder: sql`excluded.display_order` },
    });

  console.log('Seeding studios...');
  const studioIds = new Map<string, number>();
  for (const studio of SEED_STUDIOS) {
    const [row] = await db
      .insert(studios)
      .values(studio)
      .onConflictDoUpdate({
        target: studios.clerkUserId,
        set: {
          name: sql`excluded.name`,
          slug: sql`excluded.slug`,
          description: sql`excluded.description`,
          logoUrl: sql`excluded.logo_url`,
          website: sql`excluded.website`,
        },
      })
      .returning({ id: studios.id });
    studioIds.set(studio.slug, row?.id ?? 0);
  }

  for (const project of SEED_PROJECTS) {
    const studioId = studioIds.get(project.studioSlug);
    if (studioId === undefined) {
      throw new Error(`Unknown studio slug: ${project.studioSlug}`);
    }

    console.log(`Seeding project: ${project.slug}`);
    const [projectRow] = await db
      .insert(projects)
      .values({
        studioId,
        slug: project.slug,
        title: project.title,
        tagline: project.tagline,
        description: project.description,
        coverImageUrl: project.coverImageUrl,
        category: project.category,
        goalAmount: project.goalAmount,
        status: project.status,
        featured: project.featured,
        endsAt:
          project.endsAtDays === null
            ? null
            : new Date(Date.now() + project.endsAtDays * 8640_0000),
        currency: 'USD',
      })
      .onConflictDoUpdate({
        target: projects.slug,
        set: {
          title: sql`excluded.title`,
          tagline: sql`excluded.tagline`,
          description: sql`excluded.description`,
          coverImageUrl: sql`excluded.cover_image_url`,
          category: sql`excluded.category`,
          goalAmount: sql`excluded.goal_amount`,
          status: sql`excluded.status`,
          featured: sql`excluded.featured`,
          endsAt: sql`excluded.ends_at`,
        },
      })
      .returning({ id: projects.id });

    const projectId = projectRow?.id;

    if (projectId === undefined) {
      throw new Error(`Failed to insert project: ${project.slug}`);
    }

    await db.delete(tiers).where(eq(tiers.projectId, projectId));
    for (const tier of project.tiers) {
      await db.insert(tiers).values({
        projectId,
        title: tier.title,
        description: tier.description,
        price: tier.price,
        currency: 'USD',
        limitedQuantity: tier.limitedQuantity,
        reward: tier.reward,
        displayOrder: tier.displayOrder,
        active: true,
      });
    }

    await db.delete(ledgers).where(eq(ledgers.projectId, projectId));
    for (const ledger of project.ledgers) {
      await db.insert(ledgers).values({
        projectId,
        label: ledger.label,
        amount: ledger.amount,
        currency: 'USD',
        note: ledger.note,
        displayOrder: ledger.displayOrder,
      });
    }

    await db.delete(projectBlocks).where(eq(projectBlocks.projectId, projectId));
    for (const block of project.blocks) {
      await db.insert(projectBlocks).values({
        projectId,
        type: block.type,
        content: block.content,
        displayOrder: block.displayOrder,
      });
    }

    await db.delete(projectImages).where(eq(projectImages.projectId, projectId));
    for (const [index, imageUrl] of project.galleryImages.entries()) {
      await db.insert(projectImages).values({
        projectId,
        imageUrl,
        altText: `${project.title} gallery ${index + 1}`,
        displayOrder: index,
      });
    }
  }

  console.log('Seeding sample pledges...');
  const allTiers = await db.select().from(tiers);
  const sampleBackers = [
    { id: 'seed_backer_1', name: 'Mika' },
    { id: 'seed_backer_2', name: 'Devon' },
    { id: 'seed_backer_3', name: 'Aria' },
  ];
  let pledgeIndex = 0;
  for (const tier of allTiers) {
    if (tier.limitedQuantity !== null && tier.limitedQuantity < 2) {
      continue;
    }
    const backer = sampleBackers[pledgeIndex % sampleBackers.length] ?? sampleBackers[0];
    if (!backer) {
      continue;
    }
    pledgeIndex += 1;
    await db
      .insert(pledges)
      .values({
        tierId: tier.id,
        projectId: tier.projectId,
        backerClerkUserId: backer.id,
        backerName: backer.name,
        amount: tier.price,
        currency: tier.currency,
        reward: tier.reward,
        status: 'confirmed',
        paymentRef: crypto.randomUUID(),
      })
      .onConflictDoNothing();
    await db
      .update(tiers)
      .set({ claimedQuantity: sql`${tiers.claimedQuantity} + 1` })
      .where(eq(tiers.id, tier.id));
  }

  console.log('Seed complete.');
  await pool.end();
};

void (async () => {
  try {
    await seed();
  } catch (error: unknown) {
    console.error(error);
    process.exit(1);
  }
})();
