"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Sample data
const leaderboardData = [
  {
    id: 1,
    xp: 2340,
    rank: 1,
    walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  },
  {
    id: 2,
    xp: 2120,
    rank: 2,
    walletAddress: "0x3E5e9111ae8eB78Fe1CC3bb8915d5D461F3Ef9A9",
  },
  {
    id: 3,
    xp: 1890,
    rank: 3,
    walletAddress: "0x28a8746e75304c0780E011BEd21C72cD78cd535E",
  },
  {
    id: 4,
    xp: 1670,
    rank: 4,
    walletAddress: "0xACa94ef8bD5ffEE41947b4585a84BdA5a3d3DA6E",
  },
  {
    id: 5,
    xp: 1540,
    rank: 5,
    walletAddress: "0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e",
  },
  {
    id: 6,
    xp: 1320,
    rank: 6,
    walletAddress: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",
  },
  {
    id: 7,
    xp: 1260,
    rank: 7,
    walletAddress: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
  },
  {
    id: 8,
    xp: 980,
    rank: 8,
    walletAddress: "0xdf3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
  },
];

export const truncateWalletAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

const LeaderboardRow = ({ user }: any) => {
  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "grid grid-cols-12 items-center py-4 px-4 rounded-xl bg-gradient-to-r from-zinc-900/80 to-zinc-800/80",
        "border border-zinc-700/50 shadow-md hover:shadow-lg transition-all duration-300"
      )}
      whileHover={{ scale: 1.02, backgroundColor: "rgba(39, 39, 42, 0.95)" }}
    >
      <div className="col-span-2 md:col-span-1 flex items-center">
        {user.rank <= 3 ? (
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-full font-bold text-sm shadow-inner",
              user.rank === 1
                ? "bg-yellow-500 text-zinc-900"
                : user.rank === 2
                ? "bg-zinc-400 text-zinc-900"
                : "bg-amber-700 text-white"
            )}
          >
            {user.rank}
          </div>
        ) : (
          <div className="flex size-8 items-center justify-center rounded-full bg-zinc-700/50 text-zinc-200 font-semibold text-sm border border-zinc-600">
            {user.rank}
          </div>
        )}
      </div>
      <div className="col-span-3 md:col-span-2 text-right">
        <span className="text-base font-semibold text-white">
          {user.xp.toLocaleString()} XP
        </span>
      </div>
      <div className="col-span-7 md:col-span-9 pl-4">
        <span className="text-zinc-300 font-mono text-xs md:text-sm tracking-tight">
          <span className="hidden md:inline">{user.walletAddress}</span>
          <span className="inline md:hidden">
            {truncateWalletAddress(user.walletAddress)}
          </span>
        </span>
      </div>
    </motion.div>
  );
};

const LeaderboardCard = ({
  title,
  data,
}: {
  title: string;
  data: typeof leaderboardData;
}) => (
  <Card className="bg-zinc-950/90 border-zinc-800/70 text-white shadow-2xl overflow-hidden backdrop-blur-sm w-full">
    <CardHeader className="pb-4 border-b border-zinc-800/40 bg-zinc-900/50">
      <CardTitle className="text-xl font-bold flex items-center">
        <motion.span
          className="inline-block size-4 bg-green-400 rounded-full mr-2 shadow-glow"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        ></motion.span>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-4">
      <div className="grid grid-cols-12 text-xs text-zinc-400 font-medium py-2 px-4 bg-zinc-900/50 rounded-t-lg border-b border-zinc-800/30">
        <div className="col-span-2 md:col-span-1">Rank</div>
        <div className="col-span-3 md:col-span-2 text-right">XP</div>
        <div className="col-span-7 md:col-span-9 pl-4">Wallet Address</div>
      </div>
      <AnimatePresence>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3 py-4"
        >
          {data.map((user) => (
            <LeaderboardRow key={user.id} user={user} />
          ))}
        </motion.div>
      </AnimatePresence>
    </CardContent>
  </Card>
);

export default function EduLeaderboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <motion.h1
          className="text-4xl font-extrabold mb-3 text-white"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Can You Learn & Earn?
        </motion.h1>
        <motion.p
          className="text-lg text-zinc-300 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Master skills with AI, ace the challenges, and climb the ranks with
          XP!
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeaderboardCard title="Weekly Leaderboard" data={leaderboardData} />
        <LeaderboardCard title="Monthly Leaderboard" data={leaderboardData} />
      </div>
    </div>
  );
}
