package com.cms.repository;

import com.cms.entity.Attachment;
import com.cms.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    List<Attachment> findByComplaint(Complaint complaint);
}
