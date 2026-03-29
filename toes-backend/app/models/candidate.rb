class Candidate < ApplicationRecord
  belongs_to :election
  belongs_to :registration_key

  has_one_attached :photo
  has_many :votes, dependent: :destroy
  has_many :questions, dependent: :destroy

  validates :name, presence: true
  validates :position, presence: true
  validates :election, presence: true
  validates :registration_key, presence: true
end
