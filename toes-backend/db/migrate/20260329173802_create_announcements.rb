class CreateAnnouncements < ActiveRecord::Migration[8.0]
  def change
    create_table :announcements do |t|
      t.string   :title,         null: false
      t.text     :body,          null: false
      t.references :election,    null: true,  foreign_key: true
      t.integer  :admin_user_id, null: false

      t.timestamps
    end
    add_index :announcements, :created_at
  end
end
