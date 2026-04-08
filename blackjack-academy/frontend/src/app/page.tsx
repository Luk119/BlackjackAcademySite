'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';

const FEATURES = [
  { icon: '🃏', title: 'Interaktywna rozgrywka', desc: 'Graj w blackjacka przeciwko realistycznemu krupierowi z pełnymi zasadami kasyna' },
  { icon: '📚', title: 'Ustrukturyzowane lekcje', desc: 'Od absolutnego początku do zaawansowanego liczenia kart w 5 modułach' },
  { icon: '🧮', title: 'Liczenie kart', desc: 'Hi-Lo, Hi-Opt I, KO, Omega II — naucz się i ćwicz wszystkie systemy' },
  { icon: '📊', title: 'Tablice strategii', desc: 'Interaktywne tablice podstawowej strategii z podpowiedziami w czasie gry' },
  { icon: '🏆', title: 'Śledź postępy', desc: 'System XP, osiągnięcia, statystyki sesji i globalne rankingi' },
  { icon: '🤖', title: 'Trener AI', desc: 'Każda decyzja analizowana — ucz się na błędach natychmiast' },
];

export default function HomePage() {
  const { isAuthenticated } = useUserStore();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-felt-dark/30 to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-6xl mb-4 select-none">♠ ♥ ♦ ♣</div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gold-shimmer">Opanuj Blackjacka.</span>
            <br />
            <span className="text-white">Pokonaj Kasyno.</span>
          </h1>

          <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto">
            Naucz się grać perfekcyjną strategią blackjacka i zaawansowanymi technikami liczenia kart
            poprzez interaktywne lekcje, prawdziwą rozgrywkę i natychmiastową informację zwrotną od AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={isAuthenticated ? '/lessons' : '/register'}>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(212, 175, 55, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-gold-dark to-gold text-black font-bold text-lg rounded-xl shadow-lg"
              >
                {isAuthenticated ? 'Przejdź do lekcji' : 'Zacznij naukę za darmo'}
              </motion.button>
            </Link>
            <Link href="/game">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gray-800 border border-gray-700 text-white font-bold text-lg rounded-xl hover:bg-gray-700"
              >
                Zagraj teraz →
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-3xl font-bold text-center mb-12 text-white"
        >
          Wszystko czego potrzebujesz, żeby wygrać
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, borderColor: 'rgba(212, 175, 55, 0.5)' }}
              className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 backdrop-blur-sm transition-colors"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center bg-gradient-to-r from-felt-dark/50 via-gray-900 to-felt-dark/50">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="max-w-xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Gotowy na liczenie kart?</h2>
          <p className="text-gray-400 mb-8">Dołącz do tysięcy graczy uczących się pokonać kasyno matematyką i dyscypliną.</p>
          <Link href={isAuthenticated ? '/lessons' : '/register'}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-10 py-4 bg-gradient-to-r from-gold-dark to-gold text-black font-bold text-lg rounded-xl shadow-xl"
            >
              {isAuthenticated ? 'Przejdź do lekcji' : 'Zacznij — to bezpłatne'}
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
