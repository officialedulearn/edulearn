"use client";

import { getUser } from "@/actions/login";
import { getUserFromDetails } from "@/actions/login";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Router } from "lucide-react";
import { claimTokensForStudent as claimTokens, rewardCertificateToStudent } from "@/actions/claim-assets";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"



interface UserData {
  id: string;
  address: string;
  xp: number;
}

const Page = () => {
  const [userAddress, setUserAddress] = useState<string | undefined>("");
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAlert, setShowAlert] = useState(false);
const [alertMessage, setAlertMessage] = useState("Your asset has been minted successfully!");


  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);

        // Get user from auth payload
        const userFromPayload = await getUser();
        const address = userFromPayload?.sub;
        setUserAddress(address);

        if (address) {
          // Get user data from database
          const userFromDB = await getUserFromDetails(address as string);
          setUser(userFromDB);
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []); 
  const getUserLevel = (xp: number) => {
    if (xp >= 5000) return { level: 5, title: "Expert" };
    if (xp >= 3000) return { level: 4, title: "Advanced" };
    if (xp >= 1500) return { level: 3, title: "Intermediate" };
    if (xp >= 500) return { level: 2, title: "Beginner" };
    return { level: 1, title: "Novice" };
  };

  const userLevel = user?.xp
    ? getUserLevel(user.xp)
    : { level: 0, title: "Unknown" };

    const claimTokensForUser = async (userAddress: string, userPoints: number) => {
      await claimTokens(userAddress, userPoints);
      setAlertMessage("🎉 Tokens have been minted successfully!");
      setShowAlert(true);
      
    };
    
    const claimNFTforUser = async (address: string, userPoints: number) => {
      await rewardCertificateToStudent(address, userPoints);
      setAlertMessage("🎉 NFT has been rewarded successfully!");
      setShowAlert(true);
    };
    
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 text-white">Your Profile</h1>
        <p className="text-zinc-400">
          Manage your account and check your rewards
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="md:col-span-1"
        >
          <Card className="bg-zinc-900/90 border-zinc-800 text-white h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-zinc-100">
                Account Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-4">
                <div className="size-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-2xl font-bold mb-4">
                  {userLevel.level}
                </div>
                <Badge className="mb-2 bg-emerald-600 hover:bg-emerald-700">
                  {userLevel.title}
                </Badge>
                <p className="text-sm text-zinc-400 mb-4 font-mono">
                  {user?.address ? (
                    <>
                      {user.address.substring(0, 6)}...
                      {user.address.substring(user.address.length - 4)}
                    </>
                  ) : (
                    "Address unavailable"
                  )}
                </p>
                <div className="w-full mt-2 py-2 px-3 rounded-md bg-zinc-800 border border-zinc-700">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-400">Current XP</span>
                    <span className="font-medium text-emerald-400">
                      {user?.xp?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rewards Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="md:col-span-2"
        >
          <Card className="bg-zinc-900/90 border-zinc-800 text-white h-full">
            <CardHeader className="pb-2 border-b border-zinc-800">
              <CardTitle className="text-lg font-medium text-zinc-100">
                Rewards Available
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {user?.xp && user.xp >= 500 ? (
                <div className="space-y-4">
                  <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-800/50 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-emerald-300">
                        500 XP milestone
                      </h3>
                      <p className="text-sm text-zinc-400">
                        Unlock some EDU Tokens
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md text-white font-medium transition-colors duration-200"
                      onClick={() => {
                        claimTokensForUser(userAddress as string, user.xp!);
                      }}
                    >
                      Claim
                    </motion.button>
                  </div>

                  {user.xp >= 1000 && (
                    <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-800/50 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-emerald-300">
                          XP Milestone: 1000
                        </h3>
                        <p className="text-sm text-zinc-400">Unlock NFT</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md text-white font-medium transition-colors duration-200"
                        onClick={() => claimNFTforUser(userAddress as unknown as string, user.xp!)}
                      >
                        Claim
                      </motion.button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-4 inline-flex items-center justify-center size-16 rounded-full bg-zinc-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="text-zinc-400"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-zinc-300 mb-2">
                    No Rewards Available Yet
                  </h3>
                  <p className="text-zinc-500 max-w-md mx-auto">
                    Complete challenges and earn at least 1000 XP to unlock
                    rewards. Keep learning to climb the leaderboard!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      {showAlert && (
  <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Success!</AlertDialogTitle>
        <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={() => setShowAlert(false)}>Close</AlertDialogCancel>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)}

    </div>
    
  );
};

export default Page;
