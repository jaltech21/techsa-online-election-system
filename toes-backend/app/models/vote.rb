class Vote < ApplicationRecord
  belongs_to :voter, class_name: "User"
  belongs_to :candidate
  belongs_to :election

  validates :voter_id, uniqueness: { scope: :election_id, message: "has already voted in this election" }
  validates :voter, :candidate, :election, presence: true
end
