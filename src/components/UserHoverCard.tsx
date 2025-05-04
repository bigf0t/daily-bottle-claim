
import React from "react";
import { User } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { CalendarIcon, Award } from "lucide-react";
import { BottleCap } from "@/components/BottleCap";

interface UserHoverCardProps {
  user: User;
  children: React.ReactNode;
  asLink?: boolean;
}

export const UserHoverCard = ({ user, children, asLink = false }: UserHoverCardProps) => {
  const formattedDate = user.createdAt ? 
    new Date(user.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }) : 'Unknown';

  const triggerContent = asLink ? (
    <a href={`/user/${user.id}`} className="font-medium hover:underline">
      {children}
    </a>
  ) : (
    <span>{children}</span>
  );

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {triggerContent}
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user.profilePicture || ""} />
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {user.username ? user.username.substring(0, 2).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-lg font-semibold">{user.username}</h4>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarIcon className="mr-1 h-4 w-4" />
              <span>Joined {formattedDate}</span>
            </div>
            <div className="flex gap-3 mt-2">
              <div className="flex items-center">
                <BottleCap className="mr-1 h-4 w-4" color="blue" size="sm" />
                <span className="text-sm font-medium">{user.totalClaims} claims</span>
              </div>
              <div className="flex items-center">
                <Award className="mr-1 h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">{user.streak} streak</span>
              </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
