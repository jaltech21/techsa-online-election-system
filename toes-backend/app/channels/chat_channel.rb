class ChatChannel < ApplicationCable::Channel
  def subscribed
    election = Election.find_by(id: params[:election_id])
    if election
      stream_from "chat_#{election.id}"
    else
      reject
    end
  end

  def unsubscribed
    stop_all_streams
  end
end
