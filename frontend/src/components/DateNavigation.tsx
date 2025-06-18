
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DateNavigationProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export const DateNavigation = ({ currentDate, onDateChange }: DateNavigationProps) => {
  const goToPreviousDay = () => {
    const previousDay = new Date(currentDate);
    previousDay.setDate(previousDay.getDate() - 1);
    onDateChange(previousDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateChange(nextDay);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isFuture = (date: Date) => {
    const today = new Date();
    return date > today;
  };

  return (
    <div className="flex items-center justify-between bg-white rounded-lg border p-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-slate-800">Trending Repositories</span>
        </div>
        <Badge variant={isToday(currentDate) ? "default" : "outline"}>
          {isToday(currentDate) ? "Today" : formatDate(currentDate)}
        </Badge>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousDay}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Day
        </Button>
        
        {!isToday(currentDate) && (
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
          >
            Today
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextDay}
          disabled={isFuture(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))}
          className="flex items-center gap-1"
        >
          Next Day
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
