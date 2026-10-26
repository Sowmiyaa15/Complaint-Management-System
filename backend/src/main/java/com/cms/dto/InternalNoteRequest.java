package com.cms.dto;

import jakarta.validation.constraints.NotBlank;

public class InternalNoteRequest {

    @NotBlank(message = "Note content cannot be empty")
    private String note;

    public InternalNoteRequest() {
    }

    public InternalNoteRequest(String note) {
        this.note = note;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
