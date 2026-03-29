class Election < ApplicationRecord
  enum :status, { draft: 0, open: 1, closed: 2 }

  has_many :registration_keys, dependent: :destroy
  has_many :candidates, dependent: :destroy
  has_many :votes, dependent: :destroy
  has_many :chat_messages, dependent: :destroy

  validates :title, presence: true
  validates :status, presence: true
end
