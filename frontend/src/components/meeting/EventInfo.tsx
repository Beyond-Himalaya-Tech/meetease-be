import {
  AccessTime as ClockIcon,
  Videocam as VideoIcon
} from "@mui/icons-material";

export type EventInfoProps = {
  organizer: string;
  title: string;
  duration: number;
  location: string;
  description: string;
};

const EventInfo = ({ organizer, title, duration, location, description }: EventInfoProps) => {
  return (
    <div className="border-r border-gray-200 p-6">
      <p className="text-xs font-medium text-gray-500">{organizer}</p>

      <h1 className="mt-2 text-2xl font-semibold text-gray-800">
        {title}
      </h1>

      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <ClockIcon sx={{ fontSize: 18 }} />
          <span>{duration} mins</span>
        </div>

        <div className="flex items-center gap-2">
          <VideoIcon sx={{ fontSize: 18 }} />
          <span>{location}</span>
        </div>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        {description}
      </p>
    </div>
  );
};

export default EventInfo;
