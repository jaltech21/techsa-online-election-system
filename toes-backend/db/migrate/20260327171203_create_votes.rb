class CreateVotes < ActiveRecord::Migration[8.0]
  def change
    create_table :votes do |t|
      t.references :voter, null: false, foreign_key: { to_table: :users }
      t.references :candidate, null: false, foreign_key: true
      t.references :election, null: false, foreign_key: true

      t.timestamps
    end
    # Enforce one-student-one-vote at DB level
    add_index :votes, [:voter_id, :election_id], unique: true
  end
end
