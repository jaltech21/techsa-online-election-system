class CreateVoterKeys < ActiveRecord::Migration[8.0]
  def change
    create_table :voter_keys do |t|
      t.string  :token, null: false
      t.boolean :used, default: false, null: false
      t.bigint  :user_id
      t.string  :membership_ref
      t.timestamps
    end
    add_index :voter_keys, :token, unique: true
    add_index :voter_keys, :user_id
  end
end
