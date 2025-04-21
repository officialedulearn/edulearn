"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAllUsersAndXPAction } from "@/actions/user-xp";
import { useState, useEffect } from "react";
import { getUser } from "@/actions/login";
import Link from "next/link";
import { truncateWalletAddress } from "@/lib/constants";



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

const LeaderboardRow = ({ user, rank, isCurrentUser }: { user: any; rank: number; isCurrentUser: boolean }) => {
 

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "grid grid-cols-12 items-center py-4 px-4 rounded-xl bg-gradient-to-r",
        isCurrentUser 
          ? "from-emerald-900/40 to-emerald-800/30 border-emerald-600/50" 
          : "from-zinc-900/80 to-zinc-800/80 border-zinc-700/50",
        "border shadow-md hover:shadow-lg transition-all duration-300"
      )}
      whileHover={{ scale: 1.02, backgroundColor: isCurrentUser ? "rgba(16, 185, 129, 0.15)" : "rgba(39, 39, 42, 0.95)" }}
    >
      <div className="col-span-2 md:col-span-1 flex items-center">
        {rank <= 3 ? (
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-full font-bold text-sm shadow-inner",
              rank === 1
                ? "bg-yellow-500 text-zinc-900"
                : rank === 2
                ? "bg-zinc-400 text-zinc-900"
                : "bg-amber-700 text-white"
            )}
          >
            {rank}
          </div>
        ) : (
          <div className="flex size-8 items-center justify-center rounded-full bg-zinc-700/50 text-zinc-200 font-semibold text-sm border border-zinc-600">
            {rank}
          </div>
        )}
      </div>
      
      <div className="col-span-3 md:col-span-2 text-right">
        <span className="text-base font-semibold text-white">
          {user.xp.toLocaleString()} XP
        </span>
      </div>
      <div className={cn(
        "col-span-7 md:col-span-9 pl-4 flex items-center justify-between",
        isCurrentUser && "text-emerald-300"
      )}>
        <span className="text-zinc-300 font-mono text-xs md:text-sm tracking-tight">
          <span className="hidden md:inline">
            {isCurrentUser ? (
              <span className="text-emerald-300">{truncateWalletAddress(user.address)} (You)</span>
            ) : (
              truncateWalletAddress(user.address)
            )}
          </span>
          <span className="inline md:hidden">
            {isCurrentUser ? (
              <span className="text-emerald-300">{truncateWalletAddress(user.address)} (You)</span>
            ) : (
              truncateWalletAddress(user.address)
            )}
          </span>
        </span>
        
        {isCurrentUser && (
          <Link href="/profile">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors duration-200"
            >
              Claim rewards in profile
            </motion.button>
          </Link>
        )}
      </div>
    </motion.div>
  );
};

const LeaderboardCard = ({
  title,
  data,
  currentUserAddress,
}: {
  title: string;
  data: { address: string; xp: number }[];
  currentUserAddress: string | null;
}) => {
  // Sort users by XP in descending order
  const sortedData = [...data].sort((a, b) => b.xp - a.xp);
  
  return (
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
            {sortedData.map((user, index) => (
              <LeaderboardRow 
                key={user.address} 
                user={user} 
                rank={index + 1}
                isCurrentUser={currentUserAddress === user.address}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default function EduLeaderboard() {
  const [allUsers, setAllUsers] = useState<{ address: string; xp: number }[]>([]);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  useEffect(() => {
    const retrieveUsersAndXP = async () => {
      const users = await getAllUsersAndXPAction();
      setAllUsers(users);
    };
    
    const fetchCurrentUser = async () => {
      const user = await getUser();
      setUserAddress(user?.sub as string);
    };
    
    fetchCurrentUser();
    retrieveUsersAndXP();
  }, []);

  // Find current user's rank for enhanced display
  const currentUserRank = allUsers
    .sort((a, b) => b.xp - a.xp)
    .findIndex(user => user.address === userAddress) + 1;

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

      {userAddress && currentUserRank > 0 && (
        <motion.div 
          className="mb-6 p-4 rounded-lg bg-emerald-900/20 border border-emerald-700/30 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <p className="text-emerald-300">
            You&apos;re currently ranked <span className="font-bold">#{currentUserRank}</span> with <span className="font-bold">{allUsers.find(user => user.address === userAddress)?.xp.toLocaleString()} XP</span>
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeaderboardCard 
          title="Weekly Leaderboard" 
          data={allUsers} 
          currentUserAddress={userAddress}
        />
        {/* <LeaderboardCard title="Monthly Leaderboard" data={all} currentUserAddress={userAddress} /> */}
      </div>
    </div>
  );
}