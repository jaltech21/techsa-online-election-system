class AnnouncementsChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'announcements'
  end

  def unsubscribed
    stop_all_streams
  end
end
